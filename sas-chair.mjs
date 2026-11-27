// Exact frames extracted from the published schematic SAS film, not a new model,
// training/checkpoint evolution or physical evidence. A sprite avoids relying on
// paused-video decoding on mobile browsers. Existing weight calculations stay as-is.
export const SAS_CHAIR_SOURCE = 'static/film/sas-32s.mp4';
export const SAS_CHAIR_SPRITE = 'static/film/sas-chair-64.webp';
export const SAS_CHAIR_CROP = Object.freeze({ x:80, y:240, width:740, height:440, sourceWidth:1920, sourceHeight:1080 });
export const SAS_CHAIR_FRAMES = Object.freeze(Array.from({length:64},(_,i)=>Math.round(30+(959-30)*i/63)));

export function chairFrameForProgress(progress) {
  const p=Number.isFinite(Number(progress))?Math.max(0,Math.min(1,Number(progress))):0;
  const index=Math.round(p*63);
  return {index,column:index%8,row:Math.floor(index/8),sourceFrame:SAS_CHAIR_FRAMES[index],time:SAS_CHAIR_FRAMES[index]/30};
}

export function mountSASChair(sas) {
  const host=sas?.querySelector('[data-sas-chair]');
  const input=sas?.querySelector('[data-sas-progress]');
  const image=host?.querySelector('[data-sas-chair-image]');
  if(!host||!input||!image||host.dataset.mounted==='true')return;
  host.dataset.mounted='true';
  const status=host.querySelector('[data-sas-chair-status]');
  const fallback=host.querySelector('[data-sas-chair-fallback]');
  const doc=host.ownerDocument;
  let started=false,failed=false,nearView=false,requested=false,observer=null;

  function showFrame(){
    const frame=chairFrameForProgress(Number(input.value)/100);
    image.style.left=`${-frame.column*100}%`;
    image.style.top=`${-frame.row*100}%`;
    host.dataset.frameIndex=String(frame.index);
    host.dataset.frameTime=frame.time.toFixed(3);
    host.dataset.progress=String(Math.max(0,Math.min(100,Number(input.value))));
  }
  function start(){
    if(started||failed||doc.hidden)return;
    started=true;
    image.src=SAS_CHAIR_SPRITE;
  }
  function update(){requested=true;showFrame();start();}
  image.addEventListener('load',()=>{
    if(failed)return;
    showFrame();image.hidden=false;status.hidden=true;fallback.hidden=true;
    host.dataset.state='ready';
  });
  image.addEventListener('error',()=>{
    failed=true;image.hidden=true;host.dataset.state='error';status.hidden=false;
    status.textContent='Chair preview unavailable.';fallback.hidden=false;
  });
  input.addEventListener('input',update);
  doc.addEventListener('visibilitychange',()=>{if(!doc.hidden&&(nearView||requested))start();});
  const Observer=doc.defaultView?.IntersectionObserver;
  if(Observer){
    observer=new Observer(entries=>{
      nearView=entries.some(entry=>entry.isIntersecting);
      if(nearView)start();
    },{rootMargin:'300px 0px'});
    observer.observe(host);
  }else start();
  // No animation, timers, playback or transitions: reduced-motion users get the
  // same static frames, changed only by their existing range input.
  showFrame();
  return {update,disconnect(){observer?.disconnect();}};
}
