const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const moduleUrl = pathToFileURL(path.join(root, 'measured-print-weights.mjs')).href;
const records = [
  { key: 'koala-sas', label: 'Koala, PhysRL3D-SAS', section: 'print-koala', body: 17, support: 5, total: 22 },
  { key: 'koala-trellis2', label: 'Koala, TRELLIS.2', section: 'print-koala', body: 19, support: 3, total: 22 },
  { key: 'kangaroo-sas', label: 'Kangaroo, PhysRL3D-SAS', section: 'print-kangaroo', body: 15, support: 2, total: 17 },
  { key: 'kangaroo-trellis2', label: 'Kangaroo, TRELLIS.2', section: 'print-kangaroo', body: 11, support: 2, total: 13 },
];

function text(markup) {
  return markup.replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/\s+/g, ' ').trim();
}

function physicalTable(sectionId) {
  const article = html.match(new RegExp(`<article\\b[^>]*\\bid="${sectionId}"[^>]*>([\\s\\S]*?)<\\/article>`));
  assert.ok(article, `${sectionId} exists as the linked physical-print evidence`);
  const table = article[1].match(/<table\b[^>]*>([\s\S]*?)<\/table>/);
  assert.ok(table, `${sectionId} contains its measurement table`);
  const caption = table[1].match(/<caption\b[^>]*>([\s\S]*?)<\/caption>/);
  assert.ok(caption, `${sectionId} has a source caption`);
  assert.match(text(caption[1]), /physical measurements, not slicer estimates/i);
  const headers = [...table[1].matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/g)].map(match => text(match[1]));
  assert.deepEqual(headers.slice(0, 4), ['Method', 'With supports', 'Body', 'Supports']);
  const body = table[1].match(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/);
  assert.ok(body, `${sectionId} contains measurement rows`);
  return [...body[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].map(row =>
    [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map(cell => text(cell[1])));
}

for (const expected of records) {
  test(`${expected.key} matches the existing physical-print table and retains measurement provenance`, async () => {
    const { measuredPrintWeight } = await import(moduleUrl);
    const measured = measuredPrintWeight(expected.key);
    assert.ok(measured, `${expected.key} has explicitly recorded physical weights`);
    assert.equal(measured.body, expected.body);
    assert.equal(measured.support, expected.support);
    assert.equal(measured.total, expected.total);
    assert.equal(measured.body + measured.support, measured.total);
    assert.equal(measured.source, 'physical-print');
    assert.equal(measured.sourceSection, expected.section);
    assert.equal(measured.heightMm, 100);
    assert.equal(measured.resolutionG, 1);
    for (const field of ['body', 'support', 'total']) {
      assert.ok(Number.isInteger(measured[field]), `${field} does not invent precision beyond the 1 g readings`);
    }

    const rows = physicalTable(measured.sourceSection);
    const matching = rows.filter(row => row[0] === expected.label);
    assert.equal(matching.length, 1, `${expected.label} has one unambiguous evidence row`);
    const row = matching[0];
    assert.equal(row[1], `${measured.total} g`);
    assert.equal(row[2], `${measured.body} g`);
    const supportCell = row[3].match(/^(\d+(?:\.\d+)?) g \((\d+)%\)$/);
    assert.ok(supportCell, 'support mass and rounded share are present in the table');
    assert.equal(Number(supportCell[1]), measured.support);
    assert.ok(Math.abs(measured.percent - 100 * measured.support / measured.total) < 1e-12,
      'support share uses the recorded body-plus-support total without early rounding');
    assert.equal(Number(supportCell[2]), Math.round(measured.percent));
  });
}

test('Unknown, partial, and inherited-object keys do not acquire physical weight claims', async () => {
  const { measuredPrintWeight } = await import(moduleUrl);
  for (const key of ['cat-sas', 'penguin-sas', 'koala', 'kangaroo', 'koala-sas ', 'Koala-sas',
    'koala-baseline', 'unknown-sas', '', '__proto__', 'constructor', 'toString', null, undefined]) {
    assert.equal(measuredPrintWeight(key), null, `no recorded measurement for ${String(key)}`);
  }
});

test('Physical measurement resolution agrees with the page evidence note', () => {
  const note = html.match(/<p class="note">([\s\S]*?)<\/p>/);
  assert.ok(note, 'the real-print measurement note is present');
  assert.match(text(note[1]), /kitchen scale with 1 g resolution/i);
  assert.match(text(note[1]), /supports attached and after removing them/i);
});

test('Slicer estimates remain a separate source and contain no Koala or Kangaroo weights', () => {
  const slicer = JSON.parse(fs.readFileSync(path.join(root, 'static/physics-20261118/support-weights.json'), 'utf8'));
  assert.equal(slicer.schema_version, 1);
  assert.equal(Object.keys(slicer.models).length, 9, 'the original slicer inventory stays intact');
  for (const [key, value] of Object.entries(slicer.models)) {
    assert.doesNotMatch(key, /koala|kangaroo/i);
    assert.equal(value.estimated_not_measured, true, `${key} remains explicitly estimated`);
  }
  for (const { key } of records) assert.equal(Object.hasOwn(slicer.models, key), false);
  assert.match(slicer.notes.join(' '), /slicer estimates, not physical weighing measurements/i);
});

test('The 100 mm readings do not change or relabel the 60 mm display-GLB provenance', async () => {
  const { measuredPrintWeight } = await import(moduleUrl);
  const folder = path.join(root, 'static/models/sas-20261118');
  const provenance = JSON.parse(fs.readFileSync(path.join(folder, 'provenance.json'), 'utf8'));
  // Pin the existing provenance independently of its self-reported asset hashes.
  // JSON canonicalisation here ignores indentation-only changes to the file.
  const provenanceDigest = crypto.createHash('sha256').update(JSON.stringify(provenance)).digest('hex');
  assert.equal(provenanceDigest, '10859d95e9f0782c8ff4170103c169cb3f8cbc4172c52dd32fcac904f84e5b46');
  assert.equal(provenance.length, 4);
  for (const expected of records) {
    const output = expected.key.replace('-trellis2', '-baseline') + '.glb';
    const record = provenance.find(item => item.output === output);
    assert.ok(record, `${output} retains its original provenance`);
    const file = fs.readFileSync(path.join(folder, output));
    assert.equal(file.length, record.bytes);
    assert.equal(crypto.createHash('sha256').update(file).digest('hex'), record.sha256, `${output} is unchanged`);
    assert.equal(record.massBinding, 'not verified');
    assert.equal(record.supports, 'absent');
    assert.match(record.sourceFile, /_60mm\.3mf$/);
    const sourceHeightMm = record.sourceBoundsMM[1][2] - record.sourceBoundsMM[0][2];
    assert.ok(Math.abs(sourceHeightMm - 60) < .001, `${output} retains its approximately 60 mm source height`);
    assert.equal(measuredPrintWeight(expected.key).heightMm, 100,
      'physical-print height stays separate from the display mesh export height');
  }
});
