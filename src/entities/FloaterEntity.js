"use strict";

/* 自由障碍（浮空岛 / 漂浮岩浆球） */

class FloaterEntity extends Entity {
  constructor(scene, x, y, tex, w, h, opts = {}) {
    super(scene, 'free', x, y, tex === 'tex_island' ? ArtAssets.biomeKey('island', scene.biome) : tex, w, h);
    this.isIsland = tex === 'tex_island';
    this.sprite.setDisplaySize(w, h);

    this.baseY = y;
    this.phase = Math.random() * Math.PI * 2;
    this.amp = opts.amp || 0;
    this.freq = opts.freq || 1;
    this.speedY = opts.speedY || 0;
    this.fallY = 0;
  }

  applyBiome(biome) {
    if (this.isIsland) this.sprite.setTexture(ArtAssets.biomeKey('island', biome)).setDisplaySize(this.w, this.h);
  }

  update(dt, scrollSpeed) {
    this.phase += dt * this.freq * Math.PI * 2;
    this.fallY += this.speedY * dt;
    this.y = this.baseY + Math.sin(this.phase) * this.amp + this.fallY;
    this.x -= scrollSpeed * dt;
    this.sprite.setPosition(this.x, this.y);
  }
}
