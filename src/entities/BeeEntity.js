"use strict";

/* 蜜蜂：缓慢、小范围地上下移动。威胁低。 */

class BeeEntity extends Entity {
  constructor(scene, x, y, opts = {}) {
    super(scene, 'enemy', x, y, 'tex_bee', 70, 50);

    this.baseY = y;
    this.phase = Math.random() * Math.PI * 2;
    this.amp = opts.amp || 28;    // 小范围
    this.speed = opts.speed || 1.2; // 缓慢

    this.breakable = true;
  }

  update(dt, scrollSpeed) {
    this.phase += dt * this.speed;
    this.y = this.baseY + Math.sin(this.phase) * this.amp;
    this.x -= scrollSpeed * dt;

    this.sprite.setPosition(this.x, this.y);
    this.sprite.setRotation(Math.sin(this.phase * 2) * 0.1);
  }
}
