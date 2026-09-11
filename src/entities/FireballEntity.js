"use strict";

/* 恶魂火球：
 *  - owner 为发射它的恶魂
 *  - 未反弹(reversed=false)朝玩家直线飞行，命中玩家扣血；玩家冲刺撞上 → 反弹
 *  - 反弹后(reversed=true)朝 owner(恶魂)飞去，命中恶魂将其消灭 */

class FireballEntity extends Entity {
  constructor(scene, x, y, fx, fy, owner, opts = {}) {
    // 直径 2 倍：20x20 → 40x40
    super(scene, 'fireball', x, y, 'tex_fireball', 40, 40);
    this.sprite.setDisplaySize(40, 40);

    this.fx = fx;
    this.fy = fy;
    this.owner = owner;
    this.reversed = false;
    this.spin = opts.spin || 400;
  }

  update(dt, scrollSpeed) {
    this.x += (this.fx - scrollSpeed) * dt;
    this.y += this.fy * dt;

    this.sprite.setPosition(this.x, this.y);
    this.sprite.angle += this.spin * dt;
  }

  /* 玩家冲刺撞上：调转方向飞向恶魂 */
  rebound() {
    if (this.reversed) return;
    this.reversed = true;

    const g = this.owner;
    const dx = (g ? g.x : GAME_W + 40) - this.x;
    const dy = (g ? g.y : 0) - this.y;
    const len = Math.hypot(dx, dy) || 1;

    const sp = 760;
    this.fx = dx / len * sp;
    this.fy = dy / len * sp;

    this.sprite.setTint(0xffb06a);
  }

  offscreen() {
    if (this.x - this.w / 2 > GAME_W + 120) return true; // 反弹后追歪飞出右侧
    if (this.x + this.w / 2 < -120) return true;
    if (this.y - this.h / 2 > GROUND_Y + 120) return true;
    return false;
  }
}