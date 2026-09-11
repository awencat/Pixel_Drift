"use strict";

/* 恶魂：一直停留在屏幕右方（world x 固定不随卷轴左移），
 * 轻微上下漂浮并周期性地朝玩家直线发射火球。
 * 只能被冲刺反弹的火球命中而消灭（也可被冲刺直接撞死）。 */

class GhastEntity extends Entity {
  constructor(scene, x, y, opts = {}) {
    // 直径 2.5 倍：40x34 → 100x85
    super(scene, 'ghast', x, y, 'tex_ghast', 100, 85);
    this.sprite.setDisplaySize(100, 85);

    this.baseY = y;
    this.hover = Math.random() * Math.PI * 2;
    this.fireInterval = opts.fireInterval || 2.4;
    this.timer = opts.firstFire !== undefined ? opts.firstFire : this.fireInterval * 0.6;

    this.breakable = true;
  }

  update(dt, scrollSpeed) {
    this.hover += dt * 2;
    this.y = this.baseY + Math.sin(this.hover) * 8;
    // world x 保持不变 → 屏幕上位置固定，不随卷轴移动

    this.timer -= dt;
    if (this.timer <= 0) {
      this.timer = this.fireInterval;
      this.fire();
    }

    this.sprite.setPosition(this.x, this.y);
    this.sprite.setAlpha(0.9 + 0.1 * Math.sin(this.hover * 2));
  }

  fire() {
    const scene = this.scene;
    const dx = scene.playerX - this.x;
    const dy = scene.playerY - this.y;
    const len = Math.hypot(dx, dy) || 1;
    const sp = 300;

    scene.entities.push(
      new FireballEntity(scene, this.x - 55, this.y, dx / len * sp, dy / len * sp, this)
    );
  }
}