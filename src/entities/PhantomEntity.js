"use strict";

/* 幻翼：从两侧的中上部进场，俯冲穿过玩家所在列的中段。
 * 冲刺速度使用屏幕坐标，避免地图加速把左侧进场的幻翼推回屏外。 */

class PhantomEntity extends Entity {
  constructor(scene, x, y, opts = {}) {
    super(scene, 'enemy', x, y, 'tex_phantom', 84, 52.8);

    const dx = PLAYER_X - x;
    const dy = GROUND_Y * 0.56 - y;
    const len = Math.hypot(dx, dy) || 1;
    const speed = opts.speed || 320;

    this.vx = dx / len * speed;
    this.vy = dy / len * speed;
    this.spin = opts.spin || 3;
    this.sprite.setFlipX(this.vx > 0);

    this.breakable = true;
  }

  update(dt, scrollSpeed) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.sprite.setPosition(this.x, this.y);
    const tilt = Math.atan2(this.vy, Math.abs(this.vx));
    this.sprite.setRotation(Math.max(-0.6, Math.min(0.6, tilt)) * (this.vx < 0 ? -1 : 1));
  }

  offscreen() {
    if (this.x - this.w / 2 > GAME_W + 120) return true;
    if (this.y - this.h / 2 > GROUND_Y + 120) return true; // 俯冲出底面
    return super.offscreen();
  }
}
