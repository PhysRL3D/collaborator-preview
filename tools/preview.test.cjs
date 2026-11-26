const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const base = 'https://preview.example/collaborator-preview/';
const files = ['index.html', 'examples/index.html', 'film/index.html', 'generate/index.html'];

test('All HTML resources and navigation stay inside the preview project and exist', () => {
  for (const file of [...files, 'release-20261120.js']) {
    const text = fs.readFileSync(path.join(root, file), 'utf8');
    for (const match of text.matchAll(/\b(?:href|src|poster)=["']([^"']+)["']/g)) {
      const value = match[1];
      if (/^(https?:|data:|blob:|mailto:|#)/.test(value)) continue;
      assert.ok(!value.startsWith('/'), `${file}: root-relative URL ${value}`);
      const url = new URL(value, new URL(file, base));
      assert.ok(url.pathname.startsWith('/collaborator-preview/'), `${file}: escaped project ${value}`);
      let local = decodeURIComponent(url.pathname.slice('/collaborator-preview/'.length));
      if (!local || local.endsWith('/')) local += 'index.html';
      assert.ok(fs.existsSync(path.join(root, local)), `${file}: missing ${local}`);
    }
  }
});

test('Every public page requests no indexing and no outgoing referrer', () => {
  for (const file of files) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(html, /name="robots" content="noindex,\s*nofollow"/);
    assert.match(html, /name="referrer" content="no-referrer"/);
  }
});

test('Preview omits original commit provenance and leaves GPU access unconfigured', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'static/film/edit-manifest.json')));
  assert.equal(manifest.sourceCommit, undefined);
  const renderer = fs.readFileSync(path.join(root, 'tools/render-film.cjs'), 'utf8');
  assert.doesNotMatch(renderer, /sourceCommit\s*:/, 'Re-rendering must not restore original commit provenance');
  const config = JSON.parse(fs.readFileSync(path.join(root, 'generate/config.json')));
  assert.equal(config.apiBase, null);
  assert.equal(config.publicInferenceEnabled, false);
});

test('Support initialization handles ordinary and instanced meshes together', () => {
  const source = fs.readFileSync(path.join(root, 'physics-scene.mjs'), 'utf8');
  const loop = source.match(/for\(const chunk of chunks\)\{if\(chunk\.isInstancedMesh\)\{[^\n]+\}\}/);
  assert.ok(loop, 'Only instanced supports should initialize instanceMatrix');
  const ordinary = { isInstancedMesh: false };
  const instanced = { isInstancedMesh: true, instanceMatrix: { needsUpdate: false }, computeBoundingSphere() { this.boundsUpdated = true; } };
  vm.runInNewContext(loop[0], { chunks: [ordinary, instanced] });
  assert.equal(instanced.instanceMatrix.needsUpdate, true);
  assert.equal(instanced.boundsUpdated, true);
  assert.equal(ordinary.instanceMatrix, undefined);
});
