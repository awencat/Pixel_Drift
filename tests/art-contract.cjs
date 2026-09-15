const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root, 'src/gfx/ArtAssets.js'), 'utf8') + '\nthis.art = ArtAssets;', context);
const art = context.art;
const ids = ['plain', 'beach', 'forest', 'cave', 'nether', 'basalt'];
for (const id of ids) {
  for (const kind of ['background', 'wall', 'ground', 'vine', 'island']) {
    const key = art.biomeKey(kind, { id });
    const entry = art.images.find(item => item.key === key);
    assert.ok(entry, `${id} missing ${kind}`);
  }
}
let bytes = 0;
const files = new Set();
for (const {key, url} of art.images) {
  const data = fs.readFileSync(path.join(root, url));
  assert.equal(data.subarray(1, 4).toString(), 'PNG', `${key} must be PNG`);
  assert.ok(data.readUInt32BE(16) <= 1024 && data.readUInt32BE(20) <= 1024, `${key} too large`);
  if (!files.has(url)) bytes += data.length;
  files.add(url);
}
assert.ok(bytes < 2 * 1024 * 1024, `Runtime PNG total is ${bytes} bytes`);
assert.equal(new Set(art.images.map(x => x.key)).size, art.images.length, 'Duplicate keys');
assert.equal(art.ghastFrame(0.5, 0), 'tex_ghast_charge');
assert.equal(art.ghastFrame(1.0, 0.12), 'tex_ghast_fire');
assert.equal(art.ghastFrame(1.0, 0), 'tex_ghast');
console.log(`PASS: six biome mappings, ${art.images.length} texture keys, ${files.size} PNG files, ${(bytes/1024).toFixed(1)} KiB, ghast visual states`);
