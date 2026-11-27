// Extract the user's current film panels without retiming or changing outcomes.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const source='static/film/PhysRL3D_video.mp4';
const expected='56182bd6b9930e64fbafc7440f58cd6e066b7d52ffc2056ef046132ce6da39f0';
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
if(hash(path.join(root,source))!==expected)throw Error('Unexpected source-film version');
const out=path.join(root,'static/real-print-reel');
fs.mkdirSync(out,{recursive:true});
const xs=[50,660,1270];
const clips=[];
for(const [i,name] of ['Bridge','Cat','Chair','Koala','Kangaroo','Dog'].entries()){
 clips.push({id:name.toLowerCase()+'-turn',name,kind:'turns',start:55,end:65,
  crop:{x:xs[i%3],y:i<3?180:588,width:600,height:390},
  caption:'PhysRL3D-SAS · real-print views. Accelerated and camera-stabilised in the source film.'});
}
for(const [i,name] of ['Kangaroo','Christmas tree','Penguin','Chair','Dog','Cat'].entries()){
 const kind=i<3?'release':'views',stem=name.toLowerCase().replaceAll(' ','-');
 clips.push({id:stem+'-'+kind,name,kind,start:65,end:75,
  crop:{x:xs[i%3],y:i<3?194:636,width:600,height:i<3?406:404},
  caption:(i===5?'PhysRL3D-SAS left · TRELLIS.2 right.':'TRELLIS.2 left · PhysRL3D-SAS right.')+
   ' '+(kind==='release'?'Physical release footage.':'Standing views, not a release test.')+
   ' Source film: 0.5× playback; final frames held.'});
}
for(const clip of clips){
 const file=clip.id+'.mp4',poster=clip.id+'.jpg',c=clip.crop;
 const args=['-hide_banner','-loglevel','error','-n','-ss',String(clip.start),'-i',path.join(root,source),
  '-t',String(clip.end-clip.start),'-map','0:v:0','-an','-sn','-vf',
  'crop='+[c.width,c.height,c.x,c.y].join(':'),'-c:v','libx264','-preset','fast','-crf','18',
  '-pix_fmt','yuv420p','-map_metadata','-1','-movflags','+faststart',path.join(out,file)];
 execFileSync('ffmpeg',args,{stdio:'inherit'});
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-n','-i',path.join(out,file),
  '-frames:v','1','-q:v','2',path.join(out,poster)],{stdio:'inherit'});
 Object.assign(clip,{file:'static/real-print-reel/'+file,poster:'static/real-print-reel/'+poster,
  duration:10,sha256:hash(path.join(out,file))});
 console.log('Extracted '+clip.id);
}
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({
 source,sourceSHA256:expected,
 note:'Panel crops of the supplied latest film, not new experiments. Original film playback edits and held endings are preserved. No clip has been retimed here.',
 clips
},null,2)+'\n');
