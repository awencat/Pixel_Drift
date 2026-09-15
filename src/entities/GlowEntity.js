"use strict";

/* 荧光怪：从右方进入，稍作停顿发射数颗扇形子弹，而后向左平移离屏。
 * 状态机：enter(进场) → fire(短暂停顿并齐射) → move(左移离场) */

class GlowEntity extends Entity {
  constructor(scene, x, y, opts = {}) {
    super(scene, 'enemy', x, y, 'tex_glow', 68, 60);

    this.enterX = opts.enterX || GAME_W - 190;
    this.fireCount = opts.fireCount || 4;
    this.pause = opts.pause !== undefined ? opts.pause : 0.4;
    this.state = 'enter';
    this.timer = 0;
    this.lastX = x;

    this.breakable = true;
  }

  update(dt, scrollSpeed) {
    if (this.state === 'enter') {
      this.x -= (scrollSpeed + 180) * dt;
      if (this.x <= this.enterX) {
        this.x = this.enterX;
        this.state = 'fire';
        this.timer = this.pause;
      }
    } else if (this.state === 'fire') {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.fireBurst();
        this.state = 'move';
      }
      this.x -= scrollSpeed * dt;
    } else if (this.state === 'move') {
      this.x -= (scrollSpeed + 60) * dt;
    }

    this.sprite.setPosition(this.x, this.y);
  }

  fireBurst() {
    const scene = this.scene;
    const n = this.fireCount;
    const px = scene.playerX, py = scene.playerY;

    const baseAng = Math.atan2(py - this.y, px - this.x);
    const spread = 0.34;
    const speed = 280;

    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0 : (i / (n - 1)) * 2 - 1; // -1..1
      const ang = baseAng + t * spread;
      scene.entities.push(
        new ProjectileEntity(
          scene, this.x - 10, this.y + (i - (n - 1) / 2) * 10,
          'tex_bullet', 14, 10,
          Math.cos(ang) * speed, Math.sin(ang) * speed,
          0, { type: 'glowbullet', breakable: true }
        )
      );
    }
  }
}
