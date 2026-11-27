const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const crypto=require('node:crypto');
const load=()=>import(pathToFileURL(path.join(root,'penguin-display.mjs')));
const ids=['chair','cat','poodle','xmastree','penguin','koala','kangaroo'];

test('Homepage penguin alone is paired, baseline left then SAS right',async()=>{
 const {exampleMethods,pairedExample}=await load();
 assert.deepEqual(exampleMethods('penguin',true),['trellis2','sas']);
 assert.equal(ids.flatMap(id=>exampleMethods(id,true)).length,8);
 assert.equal(ids.flatMap(id=>exampleMethods(id,false)).length,14);
 for(const id of ids.filter(id=>id!=='penguin'))assert.equal(pairedExample(id,true),false);
});
test('Mixed homepage footprints never overlap at mobile or desktop widths',async()=>{
 const {homepagePositions,pairedExample}=await load();
 for(const width of [320,390,679,680,1024,1440]){
  const positions=homepagePositions(ids,width);assert.equal(positions.length,7);
  for(let i=0;i<7;i++)for(let j=i+1;j<7;j++){
   const extent=id=>pairedExample(id,true)?[296,224]:[150,170];
   const a=extent(ids[i]),b=extent(ids[j]);
   assert.ok(Math.abs(positions[i][0]-positions[j][0])>=(a[0]+b[0])/2+29.9 ||
     Math.abs(positions[i][1]-positions[j][1])>=(a[1]+b[1])/2+39.9);
  }
 }
});
test('Original baseline is geometry-only: never borrowed support masses or replay',async()=>{
 const {ORIGINAL_PENGUIN_ASSET,ORIGINAL_PENGUIN_NOTE,geometryOnlyModel}=await load();
 assert.match(ORIGINAL_PENGUIN_ASSET,/penguin-original-20261127/);
 assert.match(ORIGINAL_PENGUIN_NOTE,/head opening and detached fragment retained/);
 assert.equal(geometryOnlyModel('penguin-trellis2'),true);
 assert.equal(geometryOnlyModel('penguin-sas'),false);
 const scene=fs.readFileSync(path.join(root,'physics-scene.mjs'),'utf8');
 assert.match(scene,/noBundle=displayOnly\|\|geometryOnly/);
 assert.match(scene,/physicsEnabled&&!noBundle/);
 assert.match(scene,/weight=noBundle\?null/);
 assert.match(scene,/Boolean\(e.weight\|\|e.measuredWeight\)/);
 assert.match(scene,/pairedExample\(g.id,oursOnly\)\?\(method==='trellis2'\?-64:64\):0/);
 assert.doesNotMatch(scene,/SAS output only|Baseline is being rechecked/);
 assert.match(scene,/sliceHeight\(state.data,sliceFraction\)/);
});
test('Page explains source defects and keeps later physical prints separate',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.match(html,/baseline’s head opening and detached fragment are retained in a lightweight display mesh/);
 assert.match(html,/later penguin real prints below use a different input/);
 assert.match(html,/SEVEN EXAMPLES/);
 const css=fs.readFileSync(path.join(root,'pair-polish.css'),'utf8');
 assert.doesNotMatch(css,/\[data-focus=penguin\].*display:none/);
});
test('Export matches its provenance; two components and the complete detached fragment survive',async()=>{
 const {ORIGINAL_PENGUIN_ASSET}=await load();
 const file=fs.readFileSync(path.join(root,ORIGINAL_PENGUIN_ASSET));
 const provenance=JSON.parse(fs.readFileSync(path.join(root,path.dirname(ORIGINAL_PENGUIN_ASSET),'provenance.json')));
 assert.equal(crypto.createHash('sha256').update(file).digest('hex'),provenance.sha256);
 assert.equal(provenance.actual3mfFloat32PositionsAndIndicesMatch,true);
 assert.equal(provenance.sourceComponents,2);assert.equal(provenance.displayComponents,2);
 assert.equal(provenance.coordinateSystem,'Z-up');assert.equal(provenance.units,'mm');
 assert.equal(provenance.scale,1);assert.deepEqual(provenance.additionalExportTranslationMm,[0,0,0]);
 const fragment=provenance.components[1];
 assert.equal(fragment.exactGeometryRetained,true);
 assert.equal(fragment.sourcePositionSHA256,fragment.displayPositionSHA256);
 assert.equal(fragment.sourceIndicesSHA256,fragment.displayIndicesSHA256);
 for(const component of provenance.components){
  assert.equal(component.source.eulerCharacteristic,component.display.eulerCharacteristic);
  assert.equal(component.source.boundaryEdges,component.display.boundaryEdges);
  assert.equal(component.source.nonManifoldEdges,component.display.nonManifoldEdges);
 }
 assert.deepEqual(provenance.prohibitedOperationsPerformed,[]);
 assert.equal(provenance.displayLODOnly,true);
 assert.equal(file.readUInt32LE(0),0x46546c67);
 const manifest=JSON.parse(file.subarray(20,20+file.readUInt32LE(12)).toString());
 assert.equal(manifest.meshes.length,2);
 const sas=fs.readFileSync(path.join(root,'static/physics-20261118/penguin-sas-body.glb'));
 assert.equal(crypto.createHash('sha256').update(sas).digest('hex'),'18f137273c875fbd519c10ea4f97ceffd66541b198d703b442b448490775dbbb');
});
