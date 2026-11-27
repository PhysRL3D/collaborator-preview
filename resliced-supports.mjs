// Verified original sliced tree-support paths, used as display geometry only.
// Spatial grouping and motion are illustrative: they do not predict breakage,
// material mass, or the supports used for the separate 100 mm physical prints.
export const RESLICED_SUPPORT_ROOT = 'static/support-reslice-20261127/';
export const RESLICED_SUPPORT_SOURCES = Object.freeze({
  'koala-sas':'00be3661ef26fe6fb8fb861348001365b4c154dc852ab7ff9b04158c2b25ef71',
  'koala-trellis2':'6200047c70b182f3df7bda1255acaefb7cec417aa540a338638000c5c1e45fc6',
  'kangaroo-sas':'3b91d076f036f4d2dfe9de032409cec0c7c46d9a927bfca4851d4b4a25f0347c',
  'kangaroo-trellis2':'bc30d1b83c8426df7b592322718569302eef959311894c2ab46f4402981e59c8',
});

export function validateReslicedSupport(manifest,key,segments){
  if(!Object.hasOwn(RESLICED_SUPPORT_SOURCES,key)||manifest?.key!==key
    ||manifest.sourceMeshSHA256!==RESLICED_SUPPORT_SOURCES[key]
    ||manifest.coordinateSystem!=='Z-up'||manifest.units!=='mm'
    ||manifest.supports?.file!==`${key}-supports.bin`||manifest.supports.stride!==8
    ||!(segments instanceof Float32Array)||segments.length===0||segments.length%8
    ||manifest.supports.count!==segments.length/8||segments.length/8>32000){
    throw Error('Unverified or mismatched sliced-support bundle');
  }
  for(let i=0;i<segments.length;i+=8){
    for(let j=0;j<8;j++)if(!Number.isFinite(segments[i+j]))throw Error('Non-finite support path');
    if(segments[i+6]<=0||segments[i+7]<=0||Math.abs(segments[i+2]-segments[i+5])>.002
      ||Math.hypot(segments[i+3]-segments[i],segments[i+4]-segments[i+1])<1e-6){
      throw Error('Invalid deposited support path');
    }
  }
  return manifest;
}

export function buildSlicedFragments(segments){
  if(!(segments instanceof Float32Array)||!segments.length||segments.length%8)throw Error('Expected support paths');
  let groups;
  // Each existing extrusion belongs to exactly one group. Nothing is filled,
  // bridged, widened, or inferred from the body geometry or measured mass.
  for(let cell=8;;cell*=1.2){
    groups=new Map();
    for(let i=0;i<segments.length;i+=8){
      const key=[0,1,2].map(axis=>Math.floor((segments[i+axis]+segments[i+axis+3])/(2*cell))).join(',');
      if(!groups.has(key))groups.set(key,[]);
      groups.get(key).push(i);
    }
    if(groups.size<=96)break;
  }
  return [...groups.values()].map(indices=>{
    const low=[Infinity,Infinity,Infinity],high=[-Infinity,-Infinity,-Infinity];
    for(const i of indices)for(let axis=0;axis<3;axis++){
      const z=axis===2?segments[i+7]/2:0;
      low[axis]=Math.min(low[axis],segments[i+axis]-z,segments[i+axis+3]-z);
      high[axis]=Math.max(high[axis],segments[i+axis]-z,segments[i+axis+3]-z);
    }
    const centre=low.map((value,axis)=>(value+high[axis])/2);
    let radius=0,padding=0;
    const bars=indices.map(i=>{
      const start=[0,1,2].map(axis=>segments[i+axis]-centre[axis]-(axis===2?segments[i+7]/2:0));
      const end=[0,1,2].map(axis=>segments[i+axis+3]-centre[axis]-(axis===2?segments[i+7]/2:0));
      const width=segments[i+6],height=segments[i+7],pad=Math.hypot(width,height)/2;
      padding=Math.max(padding,pad);
      radius=Math.max(radius,Math.hypot(...start)+pad,Math.hypot(...end)+pad);
      return {start,end,width,height};
    });
    const floorCorners=Array.from({length:8},(_,bits)=>[0,1,2].map(axis=>
      ((bits>>axis)&1?high[axis]+padding:low[axis]-padding)-centre[axis]));
    return {centre,bars,radius,floorCorners};
  });
}

export function alignSlicedFragments(fragments,translation){
  // Match the existing display body's tiny LOD-bounds centring translation.
  // Each viewer gets new centres; the shared source cache is never mutated.
  return fragments.map(fragment=>({...fragment,centre:fragment.centre.map((value,axis)=>value+translation[axis])}));
}
