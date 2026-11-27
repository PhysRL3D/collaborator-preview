const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('standalone airplane vignette is hidden without deleting its source evidence', () => {
  assert.match(html, /<div class="sim-only-case" hidden inert>/);
  for (const file of ['airplane_trellis2_sim_release.jpg', 'airplane_trellis2_sim_after.jpg']) {
    assert.ok(fs.existsSync(path.join(root, 'static/images', file)));
  }
});

test('generation workspace is offered once in the page body, not repeated under SAS', () => {
  assert.equal((html.match(/<section id="generate"/g)||[]).length,1);
  const release=fs.readFileSync(path.join(root,'release-20261120.js'),'utf8');
  assert.doesNotMatch(release, /<div class="inference-entry">/);
  assert.match(release, /<a href="generate\/">Generate a model<\/a>/);
});

test('Quantitative section and its navigation are hidden without deleting results', () => {
  const section = html.match(/<section id="results"([^>]*)>([\s\S]*?)<\/section>/);
  assert.ok(section);
  assert.match(section[1], /\bhidden\b/);
  assert.match(section[1], /\binert\b/);
  assert.equal((section[2].match(/<table>/g) || []).length, 3);
  assert.equal(crypto.createHash('sha256').update(section[2]).digest('hex'), 'ae2c1f2949a46d45dbc3a0922025264f6c1c8df2f2817b4576ed5b65dc31526e');
  const links = [...html.matchAll(/<a\b[^>]*href="#results"[^>]*>/g)];
  assert.ok(links.length);
  for (const [link] of links) assert.match(link, /\bhidden\b/);
  assert.match(fs.readFileSync(path.join(root, 'site.css'), 'utf8'), /\[hidden\]\s*\{\s*display\s*:\s*none\s*!important/);
});

test('Shared results links fall back to comparisons only while results are hidden', () => {
  const source = fs.readFileSync(path.join(root, 'site.js'), 'utf8');
  const router = source.match(/function routeLegacySection\(\)\{[\s\S]*?\n\}/)[0];
  for (const hidden of [true, false]) for (const hash of ['#results', '#highlights']) {
    let target = null, destination = null;
    vm.runInNewContext(router + '\nrouteLegacySection();', {
      window: {location: {hash, pathname:'/collaborator-preview/', search:''}, history: {state:null, replaceState(_state, _title, url) {destination=url;}}},
      document: {getElementById(id) {return id === 'results' ? {hidden, scrollIntoView() {target=id;}} : {scrollIntoView() {target=id;}};}},
      requestAnimationFrame(callback) {callback();}
    });
    if (hidden) {assert.equal(target, 'comparisons'); assert.equal(destination, '/collaborator-preview/#comparisons');}
    else if (hash === '#highlights') assert.equal(target, 'results');
    else assert.equal(destination, null);
  }
});

test('Visual content remains available and the routing script cache is updated', () => {
  for (const id of ['support-examples', 'comparisons', 'prints']) {
    const opening = html.match(new RegExp('<section id="' + id + '"[^>]*>'));
    assert.ok(opening, id);
    assert.doesNotMatch(opening[0], /\bhidden\b/);
  }
  assert.match(html, /site\.js\?v=20261127visual1/);
  assert.match(fs.readFileSync(path.join(root, 'release-20261120.js'), 'utf8'), /static\/film\/PhysRL3D_video\.mp4/);
});
