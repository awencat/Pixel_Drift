"use strict";

/* 脆弱障碍（藤蔓） */

class VineEntity extends Entity {
  constructor(scene, x, y, w, h) {
    super(scene, 'fragile', x, y, ArtAssets.biomeKey('vine', scene.biome), w, h);
    this.sprite.setDisplaySize(w, h);
    this.breakable = true;
  }

  applyBiome(biome) {
    this.sprite.setTexture(ArtAssets.biomeKey('vine', biome)).setDisplaySize(this.w, this.h);
  }
}
