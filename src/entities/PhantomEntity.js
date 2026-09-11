"use strict";

/* 幻翼：从画面右上角或左上角俯冲而下，冲刺轨迹经过屏幕正中央。
 * 生成时由 SpawnManager 传入入口位置（屏幕顶部之外）。 */

class PhantomEntity extends Entity {
  constructor(scene, x, y, opts = {}) {
    super(scene, 'enemy', x, y, 'tex_phantom', 30, 22);

    // 朝屏幕正中央俯冲
    const dx = GAME_W / 2 - x;
    const dy = GAME_H / 2 - y;
    const len = Math.hypot(dx, dy) || 1;
    const speed = opts.speed || 320;

    this.vx = dx / len * speed;
    this.vy = dy / len * speed;
    this.spin = opts.spin || 3;

    this.breakable = true;
  }

  update(dt, scrollSpeed) {
    this.x += (this.vx - scrollSpeed) * dt;
    this.y += this.vy * dt;

    this.sprite.setPosition(this.x, this.y);
    this.sprite.setRotation(this.vy > 0 ? Math.min(0.6, this.vy / 2000) : -Math.min(0.6, -this.vy / 2000));
  }

  offscreen() {
    if (this.y - this.h / 2 > GROUND_Y + 120) return true; // 俯冲出底面
    return super.offscreen();
  }
}