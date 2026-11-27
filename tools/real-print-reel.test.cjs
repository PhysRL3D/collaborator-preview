const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'static/real-print-reel/manifest.json')));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');

test('Real-print reel is derived from the exact latest film, not archived renders',()=>{
 assert.equal(manifest.sourceSHA256,'56182bd6b9930e64fbafc7440f58cd6e066b7d52ffc2056ef046132ce6da39f0');
 assert.equal(hash(manifest.source),manifest.sourceSHA256);
 assert.equal(manifest.clips.length,12);
 for(const [kind,count] of [['turns',6],['release',3],['views',3]])assert.equal(manifest.clips.filter(x=>x.kind===kind).length,count);
 for(const c of manifest.clips){
  assert.equal(c.start,c.kind==='turns'?55:65);
  assert.equal(c.end,c.kind==='turns'?65:75);
  assert.equal(hash(c.file),c.sha256);
  assert.ok(fs.statSync(path.join(root,c.poster)).size>1000);
 }
});

test('All new excerpts decode as ten-second videos without narration or personal metadata',()=>{
 for(const c of manifest.clips){
  const meta=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration:stream=codec_type,nb_frames,width,height','-of','json',path.join(root,c.file)],{encoding:'utf8'}));
  assert.ok(Math.abs(Number(meta.format.duration)-10)<.04,c.id);
  assert.equal(meta.streams.length,1,c.id);
  assert.equal(meta.streams[0].codec_type,'video');
  assert.equal(meta.streams[0].width,600);
  assert.equal(Number(meta.streams[0].nb_frames),300);
 }
});

test('Reel labels preserve the difference between release tests and standing views',()=>{
 const section=html.match(/<section id="real-print-reel"[\s\S]*?<\/section>/)[0];
 assert.equal((section.match(/<video /g)||[]).length,12);
 assert.equal((section.match(/data-real-reel-kind="turns"/g)||[]).length,6);
 assert.match(section,/Accelerated playback · camera stabilised/);
 assert.match(section,/0.5× playback · final frames held/);
 assert.match(section,/Standing views, not release tests/);
 assert.match(section,/method labels and playback edits are retained/);
 assert.match(section,/SAS left · TRELLIS.2 right/);
 assert.doesNotMatch(section,/koala-latest-360|koala-physrl3d-turntable|cat-real-print\.mp4|dog-real-print\.mp4/);
});

test('Bottom research-project wording is removed without claiming acceptance',()=>{
 assert.doesNotMatch(html,/Research project/i);
 assert.doesNotMatch(fs.readFileSync(path.join(root,'release-20261120.js'),'utf8'),/Research project/i);
 assert.match(html,/author = \{Anonymous Authors\}\s*\}/);
 assert.match(html,/No acceptance or publication venue is implied/);
});
