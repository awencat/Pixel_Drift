"use strict";

/* =========================================================================
 * [F] 实体系统 —— 基类
 * ========================================================================= */

/** 实体基类 */
class Entity {
  constructor(scene, kind, x, y, tex, w, h) {
    this.scene = scene;
    this.kind = kind;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.sprite = scene.add.sprite(x, y, tex).setDepth(10);
    if (ArtAssets.images.some(asset => asset.key === tex)) this.sprite.setDisplaySize(w, h);
    ArtAssets.animate(this.sprite, tex);

    this.vx = 0;
    this.vy = 0;
    this.dead = false;
    this.breakable = false;
    this.lethal = true;
  }

  rect() {
    return new Phaser.Geom.Rectangle(
      this.x - this.w / 2,
      this.y - this.h / 2,
      this.w,
      this.h
    );
  }

  update(dt, scrollSpeed) {
    this.x -= scrollSpeed * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.sprite.setPosition(this.x, this.y);
  }

  offscreen() {
    return this.x + this.w / 2 < -120;
  }

  kill() {
    if (this.dead) return;
    this.dead = true;
    if (this.sprite) this.sprite.destroy();
  }
}
