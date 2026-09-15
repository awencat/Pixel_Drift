// Offline technical export of two-pose ImageGen strips. No runtime factory drawing.
const sharp = require('sharp');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const colors = ['blue','green','red'];
async function png(input, output, width, height) {
  const {data,info} = await sharp(input).resize(width,height,{kernel:'nearest'}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  for(let i=3;i<data.length;i+=4) {
    data[i]=data[i]>=128?255:0;
    if(!data[i]) data[i-1]=data[i-2]=data[i-3]=0;
  }
  await sharp(data,{raw:info}).png({palette:true,colours:128,dither:0,compressionLevel:9}).toFile(output);
}
async function importParrots(...inputs) {
  if(inputs.length && inputs.length!==3) throw Error('Supply all three strips in blue, green, red order, or no arguments to rebuild.');
  for (const [i,color] of colors.entries()) {
    const source = path.join(root,'assets/source',`parrot_${color}_flight.png`);
    if(inputs[i]) await png(inputs[i],source,512,256);
    // Fixed cells preserve the head/body anchor between wing poses.
    for(let frame=0;frame<2;frame++) {
      const cell=await sharp(source).extract({left:frame*256,top:0,width:256,height:256}).png().toBuffer();
      await png(cell,path.join(root,'assets/art',`player_${color}_${frame}.png`),40,40);
    }
  }
  console.log('Exported three pairs of 40x40 transparent parrot wing poses.');
}
module.exports = importParrots;
if (require.main === module) importParrots(...process.argv.slice(2)).catch(e => { console.error(e); process.exitCode=1; });
