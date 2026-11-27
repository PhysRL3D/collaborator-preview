const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const film = path.join(root, 'static/film');
const manifest = JSON.parse(fs.readFileSync(path.join(film, 'PhysRL3D_video.json')));

test('Primary video is the exact supplied 1080p replacement, not the legacy edit', () => {
  const bytes = fs.readFileSync(path.join(film, manifest.file));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), manifest.sha256);
  assert.equal(manifest.sha256, '56182bd6b9930e64fbafc7440f58cd6e066b7d52ffc2056ef046132ce6da39f0');
  assert.deepEqual(manifest.resolution, [1920, 1080]);
  assert.equal(manifest.durationSeconds, 155.633333);
  assert.equal(manifest.audioCodec, 'aac');
  assert.ok(fs.statSync(path.join(film, manifest.poster)).size > 1000);
});

test('Replacement captions extend to the new ending and stay within the video', () => {
  const captions = fs.readFileSync(path.join(film, manifest.captions), 'utf8');
  assert.match(captions, /^WEBVTT/);
  const toSeconds = timestamp => timestamp.split(':').reduce((sum, part) => sum * 60 + Number(part), 0);
  const cues = [...captions.matchAll(/([\d:.]+) --> ([\d:.]+)/g)];
  assert.ok(cues.length > 20);
  for (const [, start, end] of cues) {
    assert.ok(toSeconds(end) >= toSeconds(start));
    assert.ok(toSeconds(end) <= manifest.durationSeconds);
  }
  assert.ok(toSeconds(cues.at(-1)[2]) > 150);
});

test('Both film entry points use the new media, captions and download URL', () => {
  for (const file of ['release-20261120.js', 'film/index.html']) {
    const text = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(text, /source src="(?:\.\.\/)?static\/film\/PhysRL3D_video\.mp4"/);
    assert.match(text, /href="(?:\.\.\/)?static\/film\/PhysRL3D_video\.mp4" download/);
    assert.match(text, /PhysRL3D_video\.vtt/);
    assert.match(text, /PhysRL3D_video-poster\.jpg/);
    assert.match(text, /2 MIN 36 SEC/);
    assert.doesNotMatch(text, /physrl3d-50s\.mp4|50 SECONDS|50-second|silent, with on-screen text/i);
    assert.match(text, /sas-32s\.mp4/);
  }
  assert.match(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), /release-20261120\.js\?v=20261127chair4/);
});
