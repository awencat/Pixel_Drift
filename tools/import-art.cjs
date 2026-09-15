// One-time slicing of the ImageGen sheets; no runtime texture painting.
// npm install --no-save sharp, then node tools/import-art.cjs <generated-images-directory>
const sharp = require('sharp');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = process.argv[2];
const ids = ['plain', 'beach', 'forest', 'cave', 'nether', 'basalt'];
const out = path.join(root, 'assets/art');
const files = {
  background: 'exec-7cd586e4-09a8-4f8f-bead-586b138e906c.png',
  material: 'exec-1b0dfcf0-a570-4721-b5d1-6c858cc7fd5f.png',
  sprite: 'exec-6ae62e7d-2c30-499e-a730-0b46c042cf00.png',
  obstacle: 'exec-aee710fd-4952-47b6-a002-b21ccc642fdc.png',
};
async function save(input, name, w, h, opaque = false) {
  let p = sharp(input).resize(w, h, { fit: 'fill', kernel: 'nearest' });
  if (opaque) p = p.removeAlpha();
  else {
    const {data, info} = await p.ensureAlpha().raw().toBuffer({resolveWithObject:true});
    // Alpha is quantized to hard coverage for nearest-neighbor game sprites.
    for(let i=3;i<data.length;i+=4) {
      data[i] = data[i] >= 110 ? 255 : 0;
      if(!data[i]) data[i-1]=data[i-2]=data[i-3]=0;
    }
    p = sharp(data, {raw:info});
  }
  await p.png({palette:true, colours:128, dither:0, compressionLevel:9}).toFile(path.join(out, name+'.png'));
}
async function crop(file, left, top, width, height) {
  return sharp(path.join(source, files[file])).extract({left,top,width,height}).png().toBuffer();
}
async function trim(input) {
  const {data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let x0=info.width,y0=info.height,x1=0,y1=0;
  for(let y=0;y<info.height;y++) for(let x=0;x<info.width;x++) {
    if(data[(y*info.width+x)*4+3]>110){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
  }
  return sharp(input).extract({left:x0,top:y0,width:x1-x0+1,height:y1-y0+1}).png().toBuffer();
}
(async()=>{
  if(!source) throw Error('Pass the ImageGen output directory. Final PNGs are already checked into assets/art.');
  await fs.mkdir(out,{recursive:true});
  const bx=[0,768], by=[0,330,658,1024];
  for(let i=0;i<6;i++) {
    const row=Math.floor(i/2);
    const half=await sharp(await crop('background',bx[i%2],by[row],768,by[row+1]-by[row]))
      .removeAlpha().resize(512,256,{fit:'fill',kernel:'nearest'}).png().toBuffer();
    const mirrored=await sharp(half).flop().png().toBuffer();
    const panorama=await sharp({create:{width:1024,height:256,channels:3,background:'#000000'}})
      .composite([{input:half,left:0,top:0},{input:mirrored,left:512,top:0}]).png().toBuffer();
    // POT dimensions avoid TileSprite's implicit resampling; reflected edges match exactly.
    await save(panorama,'background_'+ids[i],1024,256,true);
  }
  const mx=[0,295,627,941,1254],my=[0,290,594,898,1254];
  const materials=['dirt','sandstone','oak','stone','netherrack','basalt','magma','cobble','grass','sand','moss','dripstone','nether_magma','basalt_magma','oak_end','rooted_dirt'];
  for(let i=0;i<16;i++) {
    let c=i%4,r=Math.floor(i/4);
    await save(await crop('material',mx[c]+2,my[r]+2,mx[c+1]-mx[c]-4,my[r+1]-my[r]-4),'material_'+materials[i],32,32,true);
  }
  for(let i=0;i<6;i++) {
    const plant=await trim(await crop('obstacle',i*256,0,256,640));
    await save(plant,'vine_'+ids[i],32,160);
    await save(await trim(await crop('obstacle',i*256,650,256,310)),'island_'+ids[i],80,40);
  }
  const names=['bee','bee_1','bat','bat_1','phantom','phantom_1','glow','glow_1','ghast','ghast_charge','ghast_fire','enemy','stone','lava','fireball','bullet'];
  for(let i=0;i<16;i++) {
    const c=i%4,r=Math.floor(i/4),x=Math.round(c*1254/4),y=Math.round(r*1254/4);
    const cell=await crop('sprite',x,y,Math.round((c+1)*1254/4)-x,Math.round((r+1)*1254/4)-y);
    // Keep a common cell rectangle for animated pairs, avoiding per-frame size pumping.
    const sizes=i>=8&&i<=10?[64,64]:i===11?[48,36]:i>=12?[32,32]:[40,32];
    await save(i<8 ? cell : await trim(cell),names[i],...sizes);
  }
  console.log('Exported backgrounds, materials, biome obstacles, monsters and projectiles.');
  // Apply the checked-in refinement sheets last so a full export preserves the latest artwork.
  await require('./refine-art.cjs')();
})().catch(e=>{console.error(e);process.exitCode=1;});
