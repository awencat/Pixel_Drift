"use strict";

/* 墙式障碍（管道） */

class WallEntity extends Entity {
  constructor(scene, x, fromTop, height, width) {
    const y = fromTop ? height / 2 : GROUND_Y - height / 2;
    super(scene, 'wall', x, y, 'tex_wall', width, height);

    this.sprite.destroy();
    this.fromTop = fromTop;
    this.tiles = scene.add.tileSprite(-width / 2, -height / 2, width, height,
      ArtAssets.biomeKey('wall', scene.biome)).setOrigin(0).setTileScale(2);
    this.edge = scene.add.tileSprite(-width / 2, fromTop ? height / 2 - 8 : -height / 2,
      width, 8, ArtAssets.wallCapKey(scene.biome)).setOrigin(0).setTileScale(2);
    this.edge.setFlipY(fromTop);
    this.magmaBlocks = [];
    for (let offset = 64; offset + 64 <= height - 8; offset += 192) {
      this.magmaBlocks.push(scene.add.tileSprite(-width / 2, -height / 2 + offset,
        width, 64, 'tex_magma_block').setOrigin(0).setTileScale(2));
    }
    this.sprite = scene.add.container(x, y, [this.tiles, ...this.magmaBlocks, this.edge]).setDepth(10);
    this.applyBiome(scene.biome);
  }

  applyBiome(biome) {
    this.tiles.setTexture(ArtAssets.biomeKey('wall', biome));
    this.edge.setTexture(ArtAssets.wallCapKey(biome));
    const hot = biome && (biome.id === 'nether' || biome.id === 'basalt');
    this.magmaBlocks.forEach(block => block.setVisible(!!hot));
  }
}
