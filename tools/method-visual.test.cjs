const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const method = html.match(/<section id="method"[\s\S]*?<\/section>/)[0];

test('Method is a compact visual triptych without training tabs or operation copy', () => {
  assert.equal((method.match(/<figure /g)||[]).length, 3);
  assert.match(method, /FROM IMAGE TO OBJECT/);
  assert.doesNotMatch(method, /data-step|DiffusionNFT|occupancy grid|reward attainment|64³|Training loop/);
  assert.match(method, /data-method-model/);
  assert.match(method, /data-method-motion/);
  assert.match(method, /shown at different scales/);
  assert.match(method, /photographed from above/);
  assert.ok(method.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length < 60);
  for (const p of [...method.matchAll(/src="([^"]+)"/g)].map(m=>m[1])) assert.ok(fs.existsSync(path.join(root,p)));
});

test('New turntable uses the current SAS mesh with a verified asset identity', () => {
  const js = fs.readFileSync(path.join(root, 'method-visual.mjs'), 'utf8');
  const file = 'static/models/sas-20261118/koala-sas.glb';
  assert.ok(js.includes(file));
  const provenance = JSON.parse(fs.readFileSync(path.join(root,'static/models/sas-20261118/provenance.json')));
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'), provenance.find(x=>x.output==='koala-sas.glb').sha256);
  assert.doesNotMatch(js, /koala-physrl3d-turntable|old_v1|koala-physrl3d\.glb/);
  for (const required of ['IntersectionObserver', 'ResizeObserver', 'visibilitychange', 'prefers-reduced-motion', 'webglcontextlost']) assert.ok(js.includes(required), required);
});

test('The user-requested SAS weight explanation and slider remain visible and operational', () => {
  const js = fs.readFileSync(path.join(root,'release-20261120.js'),'utf8');
  const opening = js.match(/<section id="sas-film"[^>]*>/)[0];
  assert.doesNotMatch(opening, /hidden|inert/);
  assert.match(js, /data-sas-progress type="range"/);
  assert.match(js, /input.addEventListener\('input',update\)/);
  for (const key of ['stand','fidelity','material']) assert.ok(js.includes('data-sas-bar="'+key+'"'));
  assert.match(js, /Illustrative SAS mechanism/);
  assert.match(js, /Standability first\.<\/b> When too few samples/);
  assert.match(js, /Emphasise what lags\.<\/b> As the standability gate opens/);
});
