"use strict";

/* =========================================================================
 * [H] 生成管理器
 * ========================================================================= */

class SpawnManager {
  constructor(scene) {
    this.scene = scene;
    this.timer = 0.8;
  }

  update(dt) {
    const scene = this.scene;
    if (scene.state !== 'playing' || scene.transitioning) return;

    this.timer -= dt;
    if (this.timer > 0) return;

    const interval = scene.getCurrentSpawnInterval();
    this.timer = interval * Phaser.Math.FloatBetween(0.85, 1.15);

    if (Math.random() < scene.getCurrentObstacleWeight()) {
      this.spawnObstacle();
    } else {
      this.spawnReward();
    }
  }

  /* ---------------- 奖励总调度 ---------------- */

  spawnReward() {
    if (Math.random() < 0.15) this.spawnLifeCrystal();
    else this.spawnEmeralds();
  }

  /* ---------------- 障碍物总调度 ---------------- */

  spawnObstacle() {
    const weights = this.scene.biome.obstacleWeights;

    let total = 0;
    for (const k in weights) total += weights[k];

    let r = Math.random() * total;
    let type = 'wall';
    for (const k in weights) {
      r -= weights[k];
      if (r <= 0) { type = k; break; }
    }

    switch (type) {
      case 'wall':       this.spawnWall();       break;
      case 'free':       this.spawnFree();       break;
      case 'vine':       this.spawnVine();       break;
      case 'enemy':      this.spawnEnemy();      break;
      case 'projectile': this.spawnProjectile(); break;
      default:           this.spawnWall();       break;
    }
  }

  /* ---------------- 墙式障碍 ---------------- */

  spawnWall() {
    if (Math.random() < 0.60) this.spawnWallSingle();
    else this.spawnWallPair();
  }

  spawnWallSingle() {
    const scene = this.scene;
    const x = GAME_W + 100;
    const fromTop = Math.random() < 0.5;
    const width = 66;

    const minGap = 150;
    const maxHeight = GROUND_Y - minGap - 40;
    const height = Phaser.Math.Between(110, Math.max(140, maxHeight));

    scene.entities.push(new WallEntity(scene, x, fromTop, height, width));
  }

  spawnWallPair() {
    const scene = this.scene;
    const x = GAME_W + 100;
    const width = 66;
    const gap = Phaser.Math.Between(180, 230);
    const gapY = Phaser.Math.Between(gap / 2 + 50, GROUND_Y - gap / 2 - 50);

    const topH = gapY - gap / 2;
    const botH = GROUND_Y - (gapY + gap / 2);

    if (topH > 40) scene.entities.push(new WallEntity(scene, x, true, topH, width));
    if (botH > 40) scene.entities.push(new WallEntity(scene, x, false, botH, width));

    scene.entities.push(new EmeraldEntity(scene, x, gapY));
  }

  /* ---------------- 自由障碍 ---------------- */

  spawnFree() {
    const scene = this.scene;
    const x = GAME_W + 130;

    if (Math.random() < 0.5) {
      const y = Phaser.Math.Between(130, GROUND_Y - 130);
      scene.entities.push(new FloaterEntity(scene, x, y, 'tex_lava', 38, 38, {
        amp: Phaser.Math.Between(40, 80),
        freq: 0.9,
      }));
    } else {
      const y = Phaser.Math.Between(130, GROUND_Y - 110);
      scene.entities.push(new FloaterEntity(scene, x, y, 'tex_island', 120, 60, {
        amp: Phaser.Math.Between(10, 26),
        freq: 0.6,
      }));
    }
  }

  /* ---------------- 抛物线抛射物 ---------------- */

  spawnProjectile() {
    const scene = this.scene;
    const x = GAME_W + 60;
    const y = Phaser.Math.Between(140, 320);

    const vx = -(260 + Math.random() * 100);
    const vy = -(180 + Math.random() * 80);
    const gravity = 420;

    scene.entities.push(
      new ProjectileEntity(scene, x, y, 'tex_lava', 36, 36, vx, vy, gravity)
    );
  }

  /* ---------------- 脆弱障碍（藤蔓） ---------------- */

  spawnVine() {
    const scene = this.scene;
    const x = GAME_W + 100;
    const w = 40;

    const full = Math.random() < 0.5;
    const h = full ? GROUND_Y : Phaser.Math.Between(220, 360);
    const y = h / 2;

    scene.entities.push(new VineEntity(scene, x, y, w, h));
  }

  /* ---------------- 敌人 ---------------- */

  spawnEnemy() {
    const scene = this.scene;
    const x = GAME_W + 110;
    const y = Phaser.Math.Between(110, GROUND_Y - 120);

    scene.entities.push(new EnemyEntity(scene, x, y, {
      amp: Phaser.Math.Between(30, 70),
      trackSpeed: 0.35 + Math.min(0.4, scene.elapsed / 300),
    }));
  }

  /* ---------------- 绿宝石 ---------------- */

  spawnEmeralds() {
    const scene = this.scene;
    const x = GAME_W + 80;
    const count = Phaser.Math.Between(2, 4);
    const baseY = Phaser.Math.Between(100, GROUND_Y - 100);
    const gapY = 36;

    for (let i = 0; i < count; i++) {
      const y = baseY + (i - (count - 1) / 2) * gapY;
      if (y < 60 || y > GROUND_Y - 40) continue;

      let blocked = false;
      for (const e of scene.entities) {
        if (e.kind === 'emerald') continue;
        if (Math.abs(e.x - x) < 120 && Math.abs(e.y - y) < 120) {
          blocked = true; break;
        }
      }
      if (blocked) continue;

      scene.entities.push(new EmeraldEntity(scene, x, y));
    }
  }

  /* ---------------- 生命水晶 ---------------- */

  spawnLifeCrystal() {
    const scene = this.scene;
    const x = GAME_W + 80;
    const y = Phaser.Math.Between(100, GROUND_Y - 100);

    for (const e of scene.entities) {
      if (e.kind === 'emerald' || e.kind === 'life') continue;
      if (Math.abs(e.x - x) < 120 && Math.abs(e.y - y) < 120) {
        return; // 位置被障碍占用，放弃本次生成
      }
    }

    scene.entities.push(new LifeCrystalEntity(scene, x, y));
  }
}
