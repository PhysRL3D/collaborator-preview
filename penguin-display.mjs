// Same-input v1 baseline, never the later v2 rerun.
export const ORIGINAL_PENGUIN_ASSET='static/models/penguin-original-20261127/penguin-trellis2.glb';
export const ORIGINAL_PENGUIN_NOTE='Original TRELLIS.2 geometry: head opening and detached fragment retained. No repair or substitution.';
export const geometryOnlyModel=key=>key==='penguin-trellis2';
export const pairedExample=(id,oursOnly)=>!oursOnly||id==='penguin';
export const exampleMethods=(id,oursOnly)=>pairedExample(id,oursOnly)?['trellis2','sas']:['sas'];

// Actual pad widths leave room for the homepage's one paired example.
export function homepagePositions(ids,width){
  const columns=width<680?2:4,rows=[];
  for(let i=0;i<ids.length;i+=columns){
    const members=ids.slice(i,i+columns);
    rows.push({widths:members.map(id=>pairedExample(id,true)?296:150),depth:members.includes('penguin')?224:170});
  }
  const totalDepth=rows.reduce((sum,row)=>sum+row.depth,0)+Math.max(0,rows.length-1)*40;
  const positions=[];let y=-totalDepth/2;
  for(const row of rows){
    let x=-(row.widths.reduce((sum,w)=>sum+w,0)+(row.widths.length-1)*30)/2;
    for(const w of row.widths){positions.push([x+w/2,y+row.depth/2]);x+=w+30;}
    y+=row.depth+40;
  }
  return positions;
}
