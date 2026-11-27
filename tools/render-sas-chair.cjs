'use strict';
// Original editable SAS film chair, not a generated model or training replay.
// Adapted only from render-sas.cjs + sas-model.cjs in
// Documents/Codex/2026-11-15/new-chat/outputs/physrl3d_sas_film_20261120.
// The November 24 source already anchored the back to the thinning seat; the
// published November 20 MP4 predates that fix. Re-render only the interactive
// chair here. Keep the original MP4, its schedule and scientific evidence intact.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const SOURCE_FRAMES=Object.freeze(Array.from({length:64},(_,i)=>Math.round(30+(959-30)*i/63)));
const CROP=Object.freeze({x:80,y:240,width:740,height:440,sourceWidth:1920,sourceHeight:1080});
const C={ink:'#202024',muted:'#625c6a',purple:'#7752ad',teal:'#087e8b',orange:'#ba5a22',line:'#e6e0eb'};
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
function stateAt(seconds){
  // The exact editorial timing from sas-model.cjs; no reward/weight calculation.
  return {progress:smooth((seconds-7)/14),detail:smooth((seconds-20)/7)};
}
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
const txt=(s,x,y,size=30,weight=500,color=C.ink)=>`<text x="${x}" y="${y}" font-family="Helvetica Neue,Helvetica,Arial,sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">${esc(s)}</text>`;
const line=(x1,y1,x2,y2,stroke=C.line,width=2,extra='')=>`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${stroke}" stroke-width="${width}" ${extra}/>`;
const circle=(x,y,r,fill)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
const project=([x,y,z])=>[430+205*(x-.54*z),642-145*y+66*z];
const poly=(pts,fill,extra='')=>`<polygon points="${pts.map(p=>project(p).join(',')).join(' ')}" fill="${fill}" ${extra}/>`;
function box(x0,x1,y0,y1,z0,z1,palette=['#9671c5','#694297','#b695dd']){
  return poly([[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],palette[0])+
    poly([[x1,y0,z0],[x1,y0,z1],[x1,y1,z1],[x1,y1,z0]],palette[1])+
    poly([[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]],palette[2]);
}
function beam(a,b,width=.085){
  const [ax,ay,az]=a,[bx,by,bz]=b;
  return poly([[ax-width,ay,az],[ax+width,ay,az],[bx+width,by,bz],[bx-width,by,bz]],'#7752ad')+
    poly([[ax+width,ay,az],[ax+width,ay,az+.08],[bx+width,by,bz+.08],[bx+width,by,bz]],'#56317f');
}
function chairGeometry(s){
  const thin=.28-.16*s.detail,seatBottom=1.10,seatTop=seatBottom+thin;
  // All posts and slats stay embedded in the same changing seat plane.
  // The intended open spaces between the original slats are preserved.
  return {thin,seatBottom,seatTop,backBottom:seatTop-.02,legTop:1.14};
}
function chair(s){
  const rightFoot=-.24+.84*s.progress;
  const {seatBottom,seatTop,backBottom,legTop}=chairGeometry(s);
  let b=poly([[-1.15,0,-.95],[1.15,0,-.95],[1.15,0,.92],[-1.15,0,.92]],'#f5f2f8');
  b+='<ellipse cx="430" cy="644" rx="235" ry="48" fill="#342149" opacity=".045"/>';
  b+=poly([[-.70,.005,-.45],[rightFoot+.04,.005,-.45],[rightFoot+.04,.005,.52],[-.70,.005,.52]],s.progress>.4?'#d8c7ec':'#f3d7c7',`stroke="${s.progress>.4?C.purple:C.orange}" stroke-width="2.5" stroke-dasharray="8 5"`);
  for(const z of [-.4,.43]){
    b+=beam([-.64,0,z],[-.62,legTop,z],.07);
    b+=beam([rightFoot,0,z],[.61,legTop,z],.07);
  }
  b+=box(-.75,.75,seatBottom,seatTop,-.53,.57);
  const backThick=.17-.07*s.detail;
  b+=box(-.72,-.57,backBottom,2.06,-.52,-.52+backThick);
  b+=box(.57,.72,backBottom,2.06,-.52,-.52+backThick);
  b+=box(-.72,.72,1.87,2.06,-.52,-.52+backThick);
  b+=`<g opacity="${.18+.82*s.detail}">`;
  for(const x of [-.37,-.12,.13,.38])b+=box(x-.045,x+.045,backBottom,1.87,-.50,-.41);
  b+='</g>';
  const com=project([.04,1.03,.03]),floor=project([.04,.012,.03]);
  b+=line(...com,...floor,C.ink,2.5,'stroke-dasharray="6 6"')+circle(...com,11,C.ink)+circle(...com,4,'#fff');
  b+=circle(...floor,10,s.progress>.4?C.teal:C.orange);
  b+=line(com[0]+14,com[1]-6,645,com[1]-48,C.muted,1.5)+txt('Centre of mass',650,com[1]-43,24,500);
  b+=txt(s.progress<.4?'Projection outside contact':'Projection inside contact',100,708,28,600,s.progress<.4?C.orange:C.teal);
  b+=txt('Illustrative geometry · not generated checkpoints',100,748,23,450,C.muted);
  return b;
}
function chairSvgAt(seconds){
  // Same camera/projection, crop, palette and -50px timeline layout offset.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="740" height="440" viewBox="80 240 740 440"><rect x="80" y="240" width="740" height="440" fill="#fff"/><g transform="translate(0,-50)">${chair(stateAt(seconds))}</g></svg>`;
}
const hash=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
async function render(){
  // Use the existing build/runtime sharp package; no browser dependency is added.
  const sharp=require(process.env.SAS_CHAIR_SHARP||'sharp');
  const root=path.resolve(__dirname,'..'),dir=path.join(root,'static/film');
  const tiles=[];
  for(let i=0;i<SOURCE_FRAMES.length;i++){
    const input=await sharp(Buffer.from(chairSvgAt(SOURCE_FRAMES[i]/30))).resize(480,285,{fit:'fill',kernel:'lanczos3'}).png().toBuffer();
    tiles.push({input,left:(i%8)*480,top:Math.floor(i/8)*285});
  }
  const atlas=await sharp({create:{width:3840,height:2280,channels:3,background:'#fff'}}).composite(tiles).webp({quality:90}).toBuffer();
  const manifest={version:2,file:'sas-chair-64.webp',bytes:atlas.length,sha256:hash(atlas),source:'sas-32s.mp4',sourceSHA256:hash(fs.readFileSync(path.join(dir,'sas-32s.mp4'))),sourceFps:30,sourceFrames:SOURCE_FRAMES,crop:CROP,frameDimensions:[480,285],grid:[8,8],dimensions:[3840,2280],renderer:'tools/render-sas-chair.cjs',rendererSHA256:hash(fs.readFileSync(__filename)),derivation:'original-editable-SAS-schematic',correction:'Back posts and slats share seatTop - 0.02 as their embedded lower anchor throughout seat thinning.',operations:['Render the original editable chair at the same 64 film times, with connected back-to-seat joints','Retain original projection, palette, pose, slat openings and crop','Lanczos downsample each frame to 480 × 285','Tile 8 × 8 and encode WebP quality 90'],note:'Re-rendered from the original native SVG/code schematic with corrected joints; not extracted or retouched video frames, AI imagery, a real model, training checkpoints or physical evidence. The original MP4 is unchanged.'};
  fs.writeFileSync(path.join(dir,manifest.file),atlas);
  fs.writeFileSync(path.join(dir,'sas-chair-64.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(`Rendered ${SOURCE_FRAMES.length} original schematic frames; ${atlas.length} bytes.`);
}
if(require.main===module)render().catch(error=>{console.error(error);process.exitCode=1;});
module.exports={SOURCE_FRAMES,CROP,stateAt,chairGeometry,chairSvgAt,project};
