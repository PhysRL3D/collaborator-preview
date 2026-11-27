const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const source=name=>fs.readFileSync(path.join(root,name),'utf8');
const load=import(pathToFileURL(path.join(root,'sas-chair.mjs')).href);
const hash=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
const renderer=require('./render-sas-chair.cjs');

function fixture(){
  class Surface extends EventTarget{
    constructor(){super();this.dataset={};this.style={};this.hidden=false;this.textContent='';}
    emit(name){this.dispatchEvent(new Event(name));}
  }
  class Image extends Surface{
    constructor(){super();this.hidden=true;this.requests=0;}
    set src(value){this.source=value;this.requests++;}
    get src(){return this.source;}
  }
  const image=new Image(),status=new Surface(),fallback=new Surface(),host=new Surface(),input=new Surface(),doc=new Surface();
  fallback.hidden=true;input.value='0';let observer;
  doc.defaultView={IntersectionObserver:class{
    constructor(callback,options){this.callback=callback;this.options=options;observer=this;}
    observe(target){this.target=target;}
    disconnect(){this.disconnected=true;}
    intersect(value){this.callback([{target:host,isIntersecting:value}]);}
  }};
  host.ownerDocument=doc;
  host.querySelector=selector=>({'[data-sas-chair-image]':image,'[data-sas-chair-status]':status,'[data-sas-chair-fallback]':fallback})[selector];
  const sas={querySelector:selector=>({'[data-sas-chair]':host,'[data-sas-progress]':input})[selector]};
  return {sas,image,status,fallback,host,input,doc,get observer(){return observer;}};
}

test('chair sprite is re-rendered from the original editable schematic while the source film stays unchanged',async()=>{
  const {SAS_CHAIR_SOURCE,SAS_CHAIR_SPRITE,SAS_CHAIR_CROP,SAS_CHAIR_FRAMES}=await load;
  const film=JSON.parse(source('static/film/sas-manifest.json'));
  const manifest=JSON.parse(source('static/film/sas-chair-64.json'));
  const sprite=fs.readFileSync(path.join(root,SAS_CHAIR_SPRITE.split('?')[0]));
  assert.equal(SAS_CHAIR_SOURCE,'static/film/sas-32s.mp4');
  assert.equal(hash(fs.readFileSync(path.join(root,SAS_CHAIR_SOURCE))),film.sha256);
  assert.equal(manifest.sourceSHA256,film.sha256);
  assert.equal(hash(sprite),manifest.sha256);
  assert.equal(sprite.length,manifest.bytes);
  assert.equal(sprite.toString('ascii',0,4),'RIFF');
  assert.equal(sprite.toString('ascii',8,12),'WEBP');
  assert.deepEqual(manifest.crop,SAS_CHAIR_CROP);
  assert.deepEqual(manifest.sourceFrames,SAS_CHAIR_FRAMES);
  assert.deepEqual(manifest.dimensions,[3840,2280]);
  assert.equal(manifest.version,2);
  assert.equal(manifest.derivation,'original-editable-SAS-schematic');
  assert.equal(manifest.renderer,'tools/render-sas-chair.cjs');
  assert.equal(manifest.rendererSHA256,hash(fs.readFileSync(path.join(root,manifest.renderer))));
  assert.match(manifest.correction,/seatTop - 0\.02/);
  assert.match(manifest.note,/not extracted or retouched video frames/);
  assert.match(manifest.note,/original MP4 is unchanged/);
  assert.match(film.note,/Schematic geometry.*not checkpoint evolution/);
  assert.doesNotMatch(source('sas-chair.mjs'),/GLTFLoader|\.glb|requestAnimationFrame|\.play\(|currentTime|setInterval/);
});

test('back posts, all four slats and all legs stay embedded in the thinning seat at every frame',async()=>{
  const {SAS_CHAIR_FRAMES,SAS_CHAIR_CROP}=await load;
  assert.deepEqual(renderer.SOURCE_FRAMES,SAS_CHAIR_FRAMES);
  assert.deepEqual(renderer.CROP,SAS_CHAIR_CROP);
  for(const frame of SAS_CHAIR_FRAMES){
    const state=renderer.stateAt(frame/30),g=renderer.chairGeometry(state),svg=renderer.chairSvgAt(frame/30);
    assert.ok(g.backBottom>g.seatBottom&&g.backBottom<g.seatTop,`back/seat overlap at ${frame}`);
    assert.ok(g.legTop>g.seatBottom&&g.legTop<g.seatTop,`leg/seat overlap at ${frame}`);
    assert.ok(Math.abs(g.seatTop-g.backBottom-.02)<1e-12);
    const backZ=-.52+(.17-.07*state.detail);
    const parts=[[-.72,-.57,2.06,backZ],[.57,.72,2.06,backZ],...[-.37,-.12,.13,.38].map(x=>[x-.045,x+.045,1.87,-.41])];
    for(const [left,right,top,z] of parts){
      const points=[[left,g.backBottom,z],[right,g.backBottom,z],[right,top,z],[left,top,z]].map(p=>renderer.project(p).join(',')).join(' ');
      assert.ok(svg.includes(`points="${points}"`),`drawn component uses embedded anchor at ${frame}`);
    }
    assert.doesNotMatch(svg,/NaN|Infinity/);
  }
  assert.equal(renderer.chairGeometry(renderer.stateAt(1)).thin,.28);
  assert.ok(Math.abs(renderer.chairGeometry(renderer.stateAt(31.966)).thin-.12)<1e-12);
});

test('all 64 frame positions are deterministic, reversible and skip the blank intro',async()=>{
  const {chairFrameForProgress:frame,SAS_CHAIR_FRAMES}=await load;
  assert.equal(frame(0).time,1);
  assert.equal(frame(1).time,959/30);
  assert.equal(frame(-1).index,0);
  assert.equal(frame(Infinity).index,0);
  assert.equal(frame(NaN).index,0);
  assert.equal(frame(5).index,63);
  assert.equal(new Set(SAS_CHAIR_FRAMES).size,64);
  for(let i=0;i<64;i++){
    const value=frame(i/63);
    assert.equal(value.index,i);
    assert.equal(value.column,i%8);
    assert.equal(value.row,Math.floor(i/8));
    assert.ok(value.sourceFrame>=30&&value.sourceFrame<=959);
  }
  assert.deepEqual(frame(.5),frame(.5));
});

test('lazy sprite load and rapid slider input select the latest frame without a decoder',async()=>{
  const {mountSASChair}=await load;
  const f=fixture();mountSASChair(f.sas);
  assert.equal(f.image.requests,0);
  assert.equal(f.observer.options.rootMargin,'300px 0px');
  f.observer.intersect(true);
  assert.equal(f.image.requests,1);
  assert.equal(f.image.src,'static/film/sas-chair-64.webp?v=20261127joints1');
  f.input.value='25';f.input.emit('input');
  f.input.value='100';f.input.emit('input');
  f.image.emit('load');
  assert.equal(f.host.dataset.state,'ready');
  assert.equal(f.image.hidden,false);
  assert.equal(f.host.dataset.frameIndex,'63');
  assert.equal(f.image.style.left,'-700%');
  assert.equal(f.image.style.top,'-700%');
  f.input.value='0';f.input.emit('input');
  assert.equal(f.host.dataset.frameIndex,'0');
  assert.equal(f.host.dataset.frameTime,'1.000');
  assert.equal(f.image.style.left,'0%');
  assert.equal(f.image.requests,1);
  mountSASChair(f.sas);
  assert.equal(f.image.requests,1);
});

test('hidden documents defer fetching and failed images retain the original-film link',async()=>{
  const {mountSASChair}=await load;
  const f=fixture();f.doc.hidden=true;mountSASChair(f.sas);
  f.observer.intersect(true);assert.equal(f.image.requests,0);
  f.doc.hidden=false;f.doc.emit('visibilitychange');
  assert.equal(f.image.requests,1);
  f.image.emit('error');
  assert.equal(f.host.dataset.state,'error');
  assert.equal(f.image.hidden,true);
  assert.equal(f.fallback.hidden,false);
  assert.equal(f.status.hidden,false);
  assert.match(f.status.textContent,/unavailable/);
});

test('existing explanations, weights, slider and full original video remain unchanged',()=>{
  const js=source('release-20261120.js');
  assert.match(js,/<video controls playsinline preload="none" poster="static\/film\/sas-poster.png"/);
  assert.match(js,/Standability first\.<\/b> When too few samples/);
  assert.match(js,/Emphasise what lags\.<\/b> As the standability gate opens/);
  assert.match(js,/data-sas-progress type="range" min="0" max="100" value="0" step="1"/);
  assert.match(js,/const stand=Math\.round\(70-32\*p\)/);
  assert.match(js,/const fidelity=Math\.round\(20\+24\*p\)/);
  assert.match(js,/const material=100-stand-fidelity/);
  assert.match(js,/input\.addEventListener\('input',update\)/);
  assert.match(js,/sas-chair\.mjs\?v=20261127chair4/);
  assert.match(js,/Original SAS schematic · corrected joints, not generated checkpoints/);
  assert.match(js,/<img data-sas-chair-image/);
  assert.doesNotMatch(js,/data-sas-chair-video/);
});

test('sprite is responsive and static under reduced-motion preferences',()=>{
  const css=source('release-20261120.css');
  assert.match(css,/aspect-ratio:480\/285/);
  assert.match(css,/width:800%;max-width:none;height:800%/);
  assert.match(css,/@media\(max-width:860px\)\{\.sas-mechanism-grid\{grid-template-columns:1fr/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  const imageStyle=css.match(/\.sas-chair-stage img\{([^}]+)\}/)[1];
  assert.doesNotMatch(imageStyle,/transition|animation/);
});
