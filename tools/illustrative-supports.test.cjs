const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');
const helperUrl = pathToFileURL(path.join(root, 'illustrative-supports.mjs')).href;
const sharedUrl = pathToFileURL(path.join(root, 'support-weighing.mjs')).href;
const contacts = Array.from({ length: 64 }, (_, index) => ({
  x: (index % 8 - 3.5) * 5,
  y: (Math.floor(index / 8) - 3.5) * 5,
  height: 12 + index % 13 * 4,
}));

function assertPose(pose) {
  assert.equal(pose.position.length, 3);
  assert.equal(pose.rotation.length, 3);
  assert.ok([...pose.position, ...pose.rotation, pose.scale].every(Number.isFinite));
  assert.ok(pose.scale > 0 && pose.scale <= 1);
}

test('Contact-derived lattices are deterministic, sparse, and bounded by 96 fragment groups', async () => {
  const { buildIllustrativeFragments } = await import(helperUrl);
  const before = structuredClone(contacts);
  const fragments = buildIllustrativeFragments(contacts);
  assert.ok(fragments.length > 24 && fragments.length <= 96);
  assert.deepEqual(buildIllustrativeFragments(contacts), fragments);
  assert.deepEqual(contacts, before);
  assert.ok(new Set(fragments.map(fragment => fragment.centre.slice(0, 2).join(','))).size <= 24);
  for (const fragment of fragments) {
    const source = contacts.find(contact => contact.x === fragment.centre[0] && contact.y === fragment.centre[1]);
    assert.ok(source, 'each column stays beneath an actual underside sample');
    assert.ok(fragment.bars.length >= 12 && fragment.bars.length <= 24, 'thin open ribs replace solid support boxes');
    assert.ok(Number.isFinite(fragment.radius) && fragment.radius > 0);
    for (const bar of fragment.bars) {
      assert.ok(bar.width > 0 && bar.width < .6);
      assert.ok(bar.height > 0 && bar.height < .4);
      const padding = Math.hypot(bar.width, bar.height) / 2;
      for (const point of [bar.start, bar.end]) {
        assert.equal(point.length, 3);
        assert.ok(point.every(Number.isFinite));
        assert.ok(Math.hypot(point[0], point[1]) + padding <= 3.6 / 2 + 1e-10);
        assert.ok(point[2] + fragment.centre[2] - padding >= -1e-10);
        assert.ok(point[2] + fragment.centre[2] + padding <= source.height + 1e-10);
        assert.ok(Math.hypot(...point) + padding <= fragment.radius + 1e-10);
      }
    }
  }
});

test('Selected columns retain their full height in irregular 5–9 mm pieces', async () => {
  const { buildIllustrativeFragments } = await import(helperUrl);
  const fragments = buildIllustrativeFragments([{ x: 2, y: -3, height: 60 }]);
  const extents = fragments.map(fragment => {
    const padding = Math.hypot(fragment.bars[0].width, fragment.bars[0].height) / 2;
    const z = fragment.bars.flatMap(bar => [bar.start[2], bar.end[2]]);
    return [Math.min(...z) + fragment.centre[2] - padding, Math.max(...z) + fragment.centre[2] + padding];
  });
  assert.ok(Math.abs(extents[0][0]) < 1e-10);
  assert.ok(Math.abs(extents.at(-1)[1] - 60) < 1e-10);
  for (let index = 0; index < extents.length; index += 1) {
    const height = extents[index][1] - extents[index][0];
    assert.ok(height >= 5 && height <= 9);
    if (index) assert.ok(Math.abs(extents[index][0] - extents[index - 1][1]) < 1e-10);
  }
  assert.ok(new Set(extents.map(([low, high]) => (high - low).toFixed(3))).size > 3);
});

test('Input limits do not create invalid geometry or exceed the draw-call budget', async () => {
  const { buildIllustrativeFragments } = await import(helperUrl);
  assert.deepEqual(buildIllustrativeFragments(null), []);
  assert.deepEqual(buildIllustrativeFragments([]), []);
  assert.deepEqual(buildIllustrativeFragments(contacts, { maxContacts: 0 }), []);
  assert.deepEqual(buildIllustrativeFragments([{ x: NaN, y: 0, height: 12 }, { x: 0, y: 0, height: -1 }]), []);
  const limited = buildIllustrativeFragments(contacts, { maxContacts: 3, width: 2 });
  assert.ok(new Set(limited.map(fragment => fragment.centre.slice(0, 2).join(','))).size <= 3);
  assert.ok(buildIllustrativeFragments(Array.from({ length: 200 }, (_, x) => ({ x, y: 0, height: 60 })), { maxContacts: 200 }).length <= 96);
});

test('Breakup rotates and falls at full scale, then settles before the shared sweep', async () => {
  const { buildIllustrativeFragments, illustrativeFragmentPose } = await import(helperUrl);
  const { SWEEP_START } = await import(sharedUrl);
  const fragments = buildIllustrativeFragments(contacts, { maxContacts: 4 });
  let moving = 0;
  fragments.forEach((fragment, index) => {
    assert.deepEqual(illustrativeFragmentPose(fragment, index, 0), { position: fragment.centre, rotation: [0, 0, 0], scale: 1 });
    assert.deepEqual(illustrativeFragmentPose(fragment, index, .6), illustrativeFragmentPose(fragment, index, 0));
    const falling = illustrativeFragmentPose(fragment, index, 1);
    assertPose(falling);
    assert.equal(falling.scale, 1, 'breakup does not vertically squash the pieces');
    if (falling.rotation.some(value => value !== 0)) moving += 1;
    const settled = illustrativeFragmentPose(fragment, index, SWEEP_START - .1);
    assertPose(settled);
    const start = illustrativeFragmentPose(fragment, index, SWEEP_START);
    settled.position.forEach((value, axis) => assert.ok(Math.abs(value - start.position[axis]) < 1e-10));
    assert.deepEqual(settled.rotation, start.rotation);
    assert.equal(start.scale, 1);
  });
  assert.ok(moving > 0);
});

test('Collection uses shared sweep poses, fixed rotations, and the same y=-65 tray', async () => {
  const { buildIllustrativeFragments, illustrativeFragmentPose } = await import(helperUrl);
  const { SWEEP_START, SWEEP_END, RELEASE_TIME, sweepPose } = await import(sharedUrl);
  const fragments = buildIllustrativeFragments(contacts, { maxContacts: 3 });
  fragments.forEach((fragment, index) => {
    const settled = illustrativeFragmentPose(fragment, index, SWEEP_START);
    for (const time of [3.3, 4.1, 5.5]) {
      const actual = illustrativeFragmentPose(fragment, index, time);
      const expected = sweepPose(settled.position, index, fragment.radius, Math.min(time, SWEEP_END));
      assertPose(actual);
      assert.deepEqual(actual.position, expected.position);
      assert.equal(actual.scale, expected.scale);
      assert.deepEqual(actual.rotation, settled.rotation);
    }
    const collected = illustrativeFragmentPose(fragment, index, 5.5);
    assert.ok(Math.abs(collected.position[0]) <= 11);
    assert.ok(Math.abs(collected.position[1] + 65) <= 7);
    assert.ok(Math.abs(collected.scale - .32) < 1e-12);
    assert.deepEqual(illustrativeFragmentPose(fragment, index, RELEASE_TIME + 100), collected);
  });
});

test('Seeking backwards and replaying does not depend on previous poses or mutate geometry', async () => {
  const { buildIllustrativeFragments, illustrativeFragmentPose } = await import(helperUrl);
  const fragment = buildIllustrativeFragments([{ x: -5, y: 8, height: 35 }])[2];
  const original = structuredClone(fragment);
  const times = [0, 1, 2.8, 5.5];
  const expected = new Map(times.map(time => [time, illustrativeFragmentPose(fragment, 2, time)]));
  for (const time of [5.5, 0, 2.8, 1, 5.5, 1, 0]) {
    const pose = illustrativeFragmentPose(fragment, 2, time);
    assertPose(pose);
    assert.deepEqual(pose, expected.get(time));
  }
  assert.deepEqual(fragment, original);
});

test('The live viewer integrates fragments, shared collection props, dynamic legends, and fresh script versions', async () => {
  const scene = fs.readFileSync(path.join(root, 'physics-scene.mjs'), 'utf8');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const { SWEEP_START, SWEEP_END, RELEASE_TIME } = await import(sharedUrl);
  const imported = scene.match(/import\s*\{([^}]+)\}\s*from\s*['"]\.\/illustrative-supports\.mjs\?v=([^'"]+)['"]/);
  assert.ok(imported, 'the viewer loads the versioned fragment helper');
  for (const name of ['illustrativeFragmentPose']) {
    assert.ok(imported[1].split(',').map(value => value.trim()).includes(name));
    assert.match(scene, new RegExp(`\\b${name}\\s*\\(`), `${name} is called, not merely imported`);
  }
  assert.match(scene, /buildSlicedFragments\(segments\)/);
  assert.doesNotMatch(scene, /buildIllustrativeFragments|illustrativeContacts/);

  const sweeper = scene.match(/entry\.sweeper\.visible\s*=\s*[^;\n]*SWEEP_START[^;\n]*;/);
  const scale = scene.match(/entry\.scale\.visible\s*=\s*[^;\n]*released[^;\n]*;/);
  assert.ok(sweeper && scale, 'collection visibility uses the shared presentation timing');
  for (const displayOnly of [false, true]) {
    for (const [t, sweepVisible, scaleVisible] of [[0, false, true], [3.5, true, true], [5.5, false, true], [RELEASE_TIME, false, false]]) {
      const entry = { displayOnly, chunks: [{}], sweeper: {}, scale: {} };
      vm.runInNewContext(sweeper[0] + scale[0], { entry, t, SWEEP_START, SWEEP_END, released: t >= RELEASE_TIME });
      assert.equal(entry.sweeper.visible, sweepVisible, `sweeper: displayOnly=${displayOnly}, t=${t}`);
      assert.equal(entry.scale.visible, scaleVisible, `tray: displayOnly=${displayOnly}, t=${t}`);
    }
  }

  assert.equal((html.match(/\bdata-support-legend\b/g) || []).length, 2);
  for (const id of ['support-examples', 'comparisons']) {
    const section = html.match(new RegExp(`<section\\b[^>]*\\bid="${id}"[^>]*>[\\s\\S]*?<\\/section>`));
    assert.ok(section && /<span\b[^>]*\bdata-support-legend\b/.test(section[0]), `${id} exposes its dynamic legend`);
  }
  const legendBlock = scene.match(/if\(supportLegend\)\{([\s\S]*?)\n\s*\}/);
  assert.ok(legendBlock, 'the viewer updates its own support legend from available geometry');
  for (const [selected, expected] of [['koala', 'Sliced tree supports'], ['kangaroo', 'Sliced tree supports'], ['chair', 'Sliced supports'], [null, 'Support fragments']]) {
    const supportLegend = {};
    const selectedBodies = () => [{ chunks: [{}], slicedTreeSupports: ['koala', 'kangaroo'].includes(selected) }];
    vm.runInNewContext(legendBlock[0], { supportLegend, selected, selectedBodies });
    assert.equal(supportLegend.textContent, expected);
  }
  const script = html.match(/<script\b[^>]*\bsrc="physics-scene\.mjs\?v=([^"]+)"[^>]*>/);
  assert.ok(script, 'the homepage loads the versioned viewer module');
  assert.match(script[1], /^20261127effects\d+$/, 'old cached viewer code cannot hide the new collection effects');
  assert.equal(imported[2], script[1], 'viewer and helper belong to the same effect release');
});

test('Missing sliced paths preserve the model and measured weights without claiming support removal', async () => {
  const scene = fs.readFileSync(path.join(root, 'physics-scene.mjs'), 'utf8');
  const { showcaseTimeline } = await import(pathToFileURL(path.join(root, 'showcase-timeline.mjs')).href);
  const { RELEASE_TIME } = await import(sharedUrl);
  const timelineAssignment = scene.match(/showcaseState\s*=\s*showcaseTimeline\(showcaseTime,[^;\n]+;/);
  const legendBlock = scene.match(/if\(supportLegend\)\{([\s\S]*?)\n\s*\}/);
  assert.ok(timelineAssignment && legendBlock);
  for (const selected of ['koala', 'kangaroo']) {
    const measuredWeight = { source: 'physical-print', heightMm: 100, support: 5 };
    const members = [{ chunks: [], slicedTreeSupports: false, body: { visible: true }, physics: { status: 'unavailable' }, measuredWeight }];
    const before = structuredClone(members);
    const context = { showcaseState: null, showcaseTimeline, showcaseTime: 1, action: 'supports', members, RELEASE: RELEASE_TIME };
    vm.runInNewContext(timelineAssignment[0], context);
    assert.equal(context.showcaseState.phase, 'supports-unavailable');
    const supportLegend = {};
    vm.runInNewContext(legendBlock[0], { supportLegend, selected, selectedBodies: () => members });
    assert.equal(supportLegend.textContent, 'Supports unavailable');
    assert.deepEqual(members, before, 'availability must not mutate model, measured values or standing evidence');
    // A pair can retain one valid support asset when the other one fails.
    members.push({ chunks: [{}], slicedTreeSupports: true, physics: { status: 'unavailable' } });
    vm.runInNewContext(timelineAssignment[0], context);
    assert.equal(context.showcaseState.phase, 'supports');
    vm.runInNewContext(legendBlock[0], { supportLegend, selected, selectedBodies: () => members });
    assert.equal(supportLegend.textContent, 'Sliced tree supports');
  }
});
