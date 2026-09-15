// Export the revised, slender obstacles and hand-shaded wall PNGs.
// Requires Sharp only for offline export; the game consumes the resulting PNGs directly.
const sharp = require('sharp');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const out = path.join(root,'assets/art');
const source = path.join(root,'assets/source');
const ids = ['plain','beach','forest','cave','nether','basalt'];

async function png(input, destination, width, height, opaque=false) {
  let pipeline=sharp(input).resize(width,height,{fit:'fill',kernel:'nearest'});
  if(opaque) pipeline=pipeline.removeAlpha();
  else {
    const {data,info}=await pipeline.ensureAlpha().raw().toBuffer({resolveWithObject:true});
    for(let i=3;i<data.length;i+=4) {
      data[i]=data[i]>=110?255:0;
      if(!data[i]) data[i-1]=data[i-2]=data[i-3]=0;
    }
    pipeline=sharp(data,{raw:info});
  }
  await pipeline.png({palette:true,colours:128,dither:0,compressionLevel:9}).toFile(destination);
}

async function trimAlpha(input) {
  const {data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let left=info.width,top=info.height,right=0,bottom=0;
  for(let y=0;y<info.height;y++) for(let x=0;x<info.width;x++) {
    if(data[(y*info.width+x)*4+3]>=110) {
      left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);
    }
  }
  if(right<left) throw Error('Obstacle has no visible pixels');
  return sharp(input).extract({left,top,width:right-left+1,height:bottom-top+1}).png().toBuffer();
}

async function refineArt(obstacleInput,wallInput) {
  await fs.mkdir(source,{recursive:true});
  if(obstacleInput && wallInput) {
    // Keep compact, project-local source sheets for reproducible future edits.
    await png(obstacleInput,path.join(source,'slender-obstacles.png'),768,512);
    await png(wallInput,path.join(source,'polished-walls.png'),768,512,true);
  }
  for(let i=0;i<6;i++) {
    const cell=await sharp(path.join(source,'slender-obstacles.png'))
      .extract({left:i*128,top:0,width:128,height:512}).png().toBuffer();
    await png(await trimAlpha(cell),path.join(out,'vine_'+ids[i]+'.png'),32,320);
  }
  // The generated top-row dirt/sandstone boundary is at x=176 (after 1/2 resize).
  const topXs=[0,176,384,576,768],bottomXs=[0,192,384,576,768];
  const names=[...ids,'magma','grass'];
  for(let i=0;i<8;i++) {
    const row=Math.floor(i/4),col=i%4,xs=row?bottomXs:topXs;
    const cell=await sharp(path.join(source,'polished-walls.png'))
      .extract({left:xs[col],top:row*256,width:xs[col+1]-xs[col],height:256}).png().toBuffer();
    await png(cell,path.join(out,'wall_'+names[i]+'.png'),64,64,true);
  }
  for(const id of ids) {
    const filename=id==='plain'?'wall_grass.png':'wall_'+id+'.png';
    const cap=await sharp(path.join(out,filename)).extract({left:0,top:0,width:64,height:8}).png().toBuffer();
    await png(cap,path.join(out,'wallcap_'+id+'.png'),64,8,true);
  }
  console.log('Exported six 32x320 slender obstacles, eight 64x64 wall materials and six wall caps.');
}

module.exports=refineArt;
if(require.main===module) refineArt(...process.argv.slice(2)).catch(e=>{console.error(e);process.exitCode=1;});
