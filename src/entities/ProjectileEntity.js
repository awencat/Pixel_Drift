"use strict";

/* 抛物线抛射物
 *  - type：'stone'（落石，冲刺可破坏）/ 'lava'（熔岩，冲刺不可破坏）
 *  - opts.breakable 决定冲刺是否能破坏它；显示尺寸越小越占便宜
 *  ★ 未来新增抛射物类型：扩展 type 分发处（SpawnManager.spawnProjectile）即可
 */

class ProjectileEntity extends Entity {
  constructor(scene, x, y, tex, w, h, vx, vy, gravity, opts = {}) {
    super(scene, 'projectile', x, y, tex, w, h);
    this.sprite.setDisplaySize(w, h);

    this.type = opts.type || 'lava';
    this.breakable = opts.breakable === true;
    if (opts.tint !== undefined) this.sprite.setTint(opts.tint);

    this.vx = vx;
    this.vy = vy;
    this.grav = gravity;
    this.spin = opts.spin !== undefined ? opts.spin : 200;
  }

  update(dt, scrollSpeed) {
    this.vy += this.grav * dt;
    this.x += (this.vx - scrollSpeed) * dt;
    this.y += this.vy * dt;

    this.sprite.setPosition(this.x, this.y);
    this.sprite.angle += this.spin * dt;
  }

  offscreen() {
    if (this.y > GAME_H + 150) return true;
    return super.offscreen();
  }
}