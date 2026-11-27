const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const photos = {
  penguin: 'static/real-prints/penguin-sas-static-20261127.jpg',
  dog: 'static/real-prints/dog-sas-static-20261127.jpg',
  dogRear: 'static/real-prints/dog-pair-rear-20261127.jpg',
};

function attribute(tag, name) {
  return tag.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(["'])(.*?)\\1`))?.[2];
}

function text(markup) {
  return markup.replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/\s+/g, ' ').trim();
}

const cases = [...html.matchAll(/<article\b([^>]*)>([\s\S]*?)<\/article>/g)]
  .map(match => ({ key: attribute(match[1], 'data-print-case'), id: attribute(match[1], 'id'), body: match[2] }))
  .filter(item => item.key);

function printCase(key) {
  const matches = cases.filter(item => item.key === key);
  assert.equal(matches.length, 1, `${key} has one unambiguous physical-print group`);
  return matches[0].body;
}

function photoFigure(body, source) {
  const figures = [...body.matchAll(/<figure\b[^>]*>[\s\S]*?<\/figure>/g)].map(match => match[0]);
  const matches = figures.filter(figure => [...figure.matchAll(/<img\b[^>]*>/g)]
    .some(image => attribute(image[0], 'src') === source));
  assert.equal(matches.length, 1, `${source} appears once as a photograph in its evidence group`);
  const figure = matches[0];
  const image = [...figure.matchAll(/<img\b[^>]*>/g)].find(match => attribute(match[0], 'src') === source)[0];
  const caption = figure.match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/);
  assert.ok(caption, `${source} has a visible caption`);
  return { alt: attribute(image, 'alt') || '', caption: text(caption[1]) };
}

test('The three supplied static photographs exist as nonempty local JPEG assets', () => {
  for (const source of Object.values(photos)) {
    const file = path.join(root, source);
    assert.ok(fs.existsSync(file), source);
    const bytes = fs.readFileSync(file);
    assert.ok(bytes.length > 0, `${source} is not empty`);
    assert.equal(bytes.subarray(0, 2).toString('hex'), 'ffd8', `${source} contains JPEG data`);
  }
});

test('The new penguin photograph is attributed to SAS without assigning the earlier 10 g reading', () => {
  const body = printCase('penguin');
  const photo = photoFigure(body, photos.penguin);
  assert.match(photo.alt, /penguin/i);
  assert.match(`${photo.alt} ${photo.caption}`, /\bSAS\b/);
  const measurement = [...body.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)]
    .map(match => text(match[1])).find(paragraph => /\b10(?:\.0)?\s*g\b/.test(paragraph));
  assert.ok(measurement, 'the previously recorded 10 g reading is retained');
  assert.match(measurement, /\bmethod\b[^.]{0,120}(?:not recorded|unknown|unrecorded)|(?:unknown|unrecorded)[^.]{0,80}\bmethod\b/i,
    'the method of the weighed penguin remains explicitly unknown');
});

test('Dog has both photographs, an explicit rear-view method order, and no new weight claim', () => {
  const body = printCase('dog');
  const single = photoFigure(body, photos.dog);
  assert.match(single.alt, /dog/i);
  assert.match(`${single.alt} ${single.caption}`, /\bSAS\b/);
  const rear = photoFigure(body, photos.dogRear);
  assert.match(rear.caption, /TRELLIS\.2\s*\(left\)/i);
  assert.match(rear.caption, /PhysRL3D[-\s]*SAS\s*\(right\)/i);
  assert.doesNotMatch(text(body), /\b\d+(?:\.\d+)?\s*(?:g|grams?|kg)\b/i,
    'photographic identification does not introduce a Dog mass measurement');
});

test('The existing Christmas-tree photograph names SAS in both its alt text and caption', () => {
  const photo = photoFigure(printCase('xmastree'), 'static/real-prints/DSC09568.jpg');
  assert.match(photo.alt, /\bSAS\b/);
  assert.match(photo.caption, /\bSAS\b/);
});

test('The five gallery selectors match their group order and Show all controls every group', () => {
  const selected = [...html.matchAll(/<button\b[^>]*>/g)]
    .map(match => attribute(match[0], 'data-print-select')).filter(Boolean);
  const groupOrder = cases.map(item => item.key);
  assert.equal(selected.length, 5);
  assert.equal(new Set(selected).size, 5);
  assert.deepEqual(selected, groupOrder);
  assert.deepEqual([...groupOrder].sort(), ['dog', 'kangaroo', 'koala', 'penguin', 'xmastree']);
  const showAll = [...html.matchAll(/<button\b[^>]*>/g)]
    .find(match => attribute(match[0], 'id') === 'prints-show-all');
  assert.ok(showAll, 'the gallery retains its Show all control');
  const controlled = (attribute(showAll[0], 'aria-controls') || '').trim().split(/\s+/);
  assert.deepEqual(controlled, cases.map(item => item.id));
  assert.ok(controlled.includes(cases.find(item => item.key === 'dog').id));
});

test('Koala keeps its own media and the corrected alternate-view caption avoids an unsupported rear claim', () => {
  const body = printCase('koala');
  for (const source of [photos.dog, photos.dogRear]) assert.ok(!body.includes(source));
  const alternate = [...body.matchAll(/<figure\b[^>]*>[\s\S]*?<\/figure>/g)]
    .map(match => match[0]).find(figure => /koala_pair_back\.(?:webm|mp4)/.test(figure));
  assert.ok(alternate, 'the existing alternate Koala view is retained');
  const caption = alternate.match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/);
  assert.ok(caption);
  assert.match(text(caption[1]), /\bview\b/i);
  assert.doesNotMatch(text(caption[1]), /\b(?:rear|behind|back)\b/i);
});
