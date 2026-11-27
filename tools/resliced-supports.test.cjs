const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const load=import(pathToFileURL(path.join(root,'resliced-supports.mjs')).href);
const pose=import(pathToFileURL(path.join(root,'illustrative-supports.mjs')).href);

test('actual extrusion geometry is unchanged by fragment grouping',async()=>{
  const {buildSlicedFragments}=await load;
  const paths=new Float32Array(Array.from({length:300},(_,i)=>[i%10-5,Math.floor(i/10)%10-5,1+i*.1,i%10-4.5,Math.floor(i/10)%10-4.5,1+i*.1,.42,.2]).flat());
  const copy=paths.slice(),pieces=buildSlicedFragments(paths);
  assert.ok(pieces.length>1&&pieces.length<=96);
  assert.equal(pieces.reduce((n,p)=>n+p.bars.length,0),300);
  const reconstructed=[];
  for(const p of pieces)for(const b of p.bars){
    reconstructed.push([...b.start.map((v,a)=>v+p.centre[a]+(a===2?b.height/2:0)),...b.end.map((v,a)=>v+p.centre[a]+(a===2?b.height/2:0)),b.width,b.height].map(v=>v.toFixed(5)).join(','));
  }
  const original=Array.from({length:300},(_,i)=>Array.from(paths.slice(i*8,i*8+8)).map(v=>v.toFixed(5)).join(','));
  assert.deepEqual(reconstructed.sort(),original.sort());
  assert.deepEqual(paths,copy);
});

test('tree fragments keep full size while falling, then share the existing sweep sequence',async()=>{
  const {buildSlicedFragments}=await load,{illustrativeFragmentPose}=await pose;
  const pieces=buildSlicedFragments(new Float32Array([1,2,12,3,4,12,.42,.2,1,2,18,2,4,18,.42,.2]));
  for(let i=0;i<pieces.length;i++){
    const p=pieces[i],before=structuredClone(p);
    assert.deepEqual(illustrativeFragmentPose(p,i,0).position,p.centre);
    assert.equal(illustrativeFragmentPose(p,i,1.2).scale,1);
    const end=illustrativeFragmentPose(p,i,5.8);
    assert.ok(Math.abs(end.scale-.32)<1e-12);
    assert.ok(Math.abs(end.position[1]+65)<=7);
    assert.deepEqual(p,before);
  }
});

test('LOD centring is applied once to each viewer without mutating the shared path cache',async()=>{
  const {buildSlicedFragments,alignSlicedFragments}=await load;
  const pieces=buildSlicedFragments(new Float32Array([0,1,2,3,4,2,.42,.2]));
  const original=structuredClone(pieces),offset=[-.005911827,-.006048203,.000402142];
  const left=alignSlicedFragments(pieces,offset),right=alignSlicedFragments(pieces,offset);
  assert.deepEqual(left,right);assert.deepEqual(pieces,original);
  for(let i=0;i<pieces.length;i++){
    assert.deepEqual(left[i].centre,pieces[i].centre.map((v,a)=>v+offset[a]));
    assert.deepEqual(left[i].bars,pieces[i].bars);
    assert.deepEqual(left[i].floorCorners,pieces[i].floorCorners);
  }
});

test('source identity, coordinate system and support payload are validated before display',async()=>{
  const {validateReslicedSupport,RESLICED_SUPPORT_SOURCES}=await load;
  const key='koala-sas',segments=new Float32Array([0,0,.2,1,0,.2,.4,.2]);
  const manifest={key,sourceMeshSHA256:RESLICED_SUPPORT_SOURCES[key],coordinateSystem:'Z-up',units:'mm',supports:{file:key+'-supports.bin',count:1,stride:8}};
  assert.equal(validateReslicedSupport(manifest,key,segments),manifest);
  for(const bad of [{...manifest,key:'koala-trellis2'},{...manifest,sourceMeshSHA256:'wrong'}, {...manifest,units:'cm'}, {...manifest,coordinateSystem:'Y-up'}])assert.throws(()=>validateReslicedSupport(bad,key,segments));
  for(const bad of [new Float32Array(),new Float32Array([0,0,.2,1,0,.2,NaN,.2]),new Float32Array([0,0,.2,1,0,.2,0,.2])])assert.throws(()=>validateReslicedSupport(manifest,key,bad));
});

test('all four published bundles bind to unchanged display sources, not real-print weighing',async()=>{
  const {validateReslicedSupport,RESLICED_SUPPORT_SOURCES,RESLICED_SUPPORT_ROOT,buildSlicedFragments}=await load;
  for(const key of Object.keys(RESLICED_SUPPORT_SOURCES)){
    const manifest=JSON.parse(fs.readFileSync(path.join(root,RESLICED_SUPPORT_ROOT,key+'.json')));
    const data=fs.readFileSync(path.join(root,RESLICED_SUPPORT_ROOT,key+'-supports.bin'));
    const segments=new Float32Array(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength));
    assert.equal(crypto.createHash('sha256').update(data).digest('hex'),manifest.supports.sha256);
    validateReslicedSupport(manifest,key,segments);
    const pieces=buildSlicedFragments(segments);
    assert.ok(pieces.length>1&&pieces.length<=96);
    assert.equal(pieces.reduce((n,p)=>n+p.bars.length,0),manifest.supports.count);
    assert.ok(manifest.supports.fullSegmentCount>=manifest.supports.count);
    assert.equal(manifest.supports.massBinding,'not the measured 100 mm print');
  }
});
