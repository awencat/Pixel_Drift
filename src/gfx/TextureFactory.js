"use strict";

/* =========================================================================
 * [E] 占位素材工厂
 *  - 全部贴图都用 Graphics 程序化生成，项目零外部素材依赖。
 *  - 后期替换真实 sprite 时：
 *    1) 把图片放进 assets/（命名见 assets/README.md）
 *    2) 在 BootScene.preload() 中 this.load.image(key, url)
 *    3) 注释掉下方对应 makeXxx 方法
 * ========================================================================= */

const TextureFactory = {

  build(scene) {
    this.makeClouds(scene);
    this.makeHills(scene);
    this.makeGround(scene);
    this.makeCeiling(scene);
    this.makePlayers(scene);
    this.makeEmerald(scene);
    this.makeLifeCrystal(scene);
    this.makeWall(scene);
    this.makeIsland(scene);
    this.makeLava(scene);
    this.makeVine(scene);
    this.makeEnemy(scene);
  },

  /* 远景云层：480 x 260，白-灰系（可染色） */
  makeClouds(scene) {
    const W = 480, H = 260;
    const g = makeGfx(scene);
    const clouds = [
      [ 30,  70, 64, 16], [ 40,  54, 40, 16],
      [190,  40, 72, 16], [206,  24, 40, 16],
      [330, 100, 56, 16], [344,  84, 32, 16],
      [120, 160, 88, 16], [142, 144, 48, 16],
      [290, 190, 64, 16], [306, 174, 36, 16],
    ];
    clouds.forEach(([x, y, w, h]) => {
      g.fillStyle(0xffffff, 0.75);
      g.fillRect(x, y, w, h);
    });
    bake(g, 'tex_clouds', W, H);
  },

  /* 近景山丘：480 x 200 */
  makeHills(scene) {
    const W = 480, H = 200;
    const g = makeGfx(scene);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(60,  H, 96);
    g.fillCircle(230, H, 128);
    g.fillCircle(410, H, 104);
    g.fillStyle(0xd8d8d8, 1);
    g.fillCircle(150, H, 84);
    g.fillCircle(330, H, 100);
    bake(g, 'tex_hills', W, H);
  },

  /* 地面：128 x 64 */
  makeGround(scene) {
    const W = 128, H = 64;
    const g = makeGfx(scene);
    g.fillStyle(0xffffff, 1); g.fillRect(0, 0, W, H);
    g.fillStyle(0xcccccc, 1);
    g.fillRect(10, 26, 10, 7); g.fillRect(44, 40, 12, 7);
    g.fillRect(78, 22, 10, 7); g.fillRect(100, 46, 12, 7);
    g.fillRect(24, 50, 10, 6); g.fillRect(62, 18, 8, 6);
    bake(g, 'tex_ground', W, H);
  },

  /* 天花板：128 x 64（封顶群系时显示，可染色） */
  makeCeiling(scene) {
    const W = 128, H = 64;
    const g = makeGfx(scene);
    g.fillStyle(0xffffff, 1); g.fillRect(0, 0, W, H);
    g.fillStyle(0xcccccc, 1);
    g.fillRect(10, 4, 10, 7); g.fillRect(44, 8, 12, 7);
    g.fillRect(78, 2, 10, 7); g.fillRect(100, 6, 12, 7);
    g.fillRect(24, 10, 10, 6); g.fillRect(62, 2, 8, 6);
    bake(g, 'tex_ceiling', W, H);
  },

  /* 玩家飞行器：每个角色 2 帧（20x20） */
  makePlayers(scene) {
    Object.keys(CHARACTERS).forEach(key => {
      const c = CHARACTERS[key];
      for (let frame = 0; frame < 2; frame++) {
        const S = 20;
        const g = makeGfx(scene);

        g.fillStyle(c.dark, 1);   g.fillRect(2, 2, 16, 16);
        g.fillStyle(c.color, 1);  g.fillRect(3, 3, 14, 14);
        g.fillStyle(c.accent, 1); g.fillRect(7, 6, 6, 5);
        g.fillStyle(0xffffff, 1); g.fillRect(8, 7, 2, 2);

        g.fillStyle(c.dark, 1);
        if (frame === 0) {
          g.fillRect(0, 8, 3, 7);  g.fillRect(17, 8, 3, 7);
        } else {
          g.fillRect(0, 5, 3, 7);  g.fillRect(17, 11, 3, 7);
        }
        g.fillStyle(0xffd76a, frame === 0 ? 1 : 0.7);
        g.fillRect(1, 17, 6, 3);

        bake(g, `tex_player_${key}_${frame}`, S, S);
      }
    });
  },

  /* 绿宝石：12 x 12 菱形 */
  makeEmerald(scene) {
    const S = 12;
    const g = makeGfx(scene);
    g.fillStyle(0x1f7a4d, 1);
    g.fillTriangle(S / 2, 0, S, S / 2, S / 2, S);
    g.fillTriangle(S / 2, 0, 0, S / 2, S / 2, S);
    g.fillStyle(0x2ecc71, 1);
    g.fillTriangle(S / 2, 2, S - 2, S / 2, S / 2, S - 2);
    g.fillTriangle(S / 2, 2, 2, S / 2, S / 2, S - 2);
    g.fillStyle(0x9df5c4, 1);
    g.fillRect(S / 2 - 1, 3, 2, 3);
    bake(g, 'tex_emerald', S, S);
  },

  /* 生命水晶：16 x 16 红色菱形 */
  makeLifeCrystal(scene) {
    const S = 16;
    const g = makeGfx(scene);
    g.fillStyle(0x7a1515, 1);
    g.fillTriangle(S / 2, 0, S, S / 2, S / 2, S);
    g.fillTriangle(S / 2, 0, 0, S / 2, S / 2, S);
    g.fillStyle(0xff4d4d, 1);
    g.fillTriangle(S / 2, 2, S - 2, S / 2, S / 2, S - 2);
    g.fillTriangle(S / 2, 2, 2, S / 2, S / 2, S - 2);
    g.fillStyle(0xffb3b3, 1);
    g.fillRect(S / 2 - 1, 3, 2, 3);
    bake(g, 'tex_life', S, S);
  },

  /* 墙式障碍：64 x 64 砖块 */
  makeWall(scene) {
    const S = 64;
    const g = makeGfx(scene);
    g.fillStyle(0xdddddd, 1); g.fillRect(0, 0, S, S);
    g.fillStyle(0xffffff, 1); g.fillRect(2, 2, S - 4, S - 4);
    g.fillStyle(0xbbbbbb, 1);
    g.fillRect(0, S / 2 - 2, S, 4);
    g.fillRect(S / 2 - 2, 0, 4, S / 2);
    g.fillRect(S / 4 - 2, S / 2, 4, S / 2);
    g.fillRect(S * 3 / 4 - 2, S / 2, 4, S / 2);
    g.fillStyle(0xeeeeee, 1);
    g.fillRect(4, 4, 8, 8); g.fillRect(38, 4, 8, 8);
    g.fillRect(20, 36, 8, 8); g.fillRect(48, 36, 8, 8);
    bake(g, 'tex_wall', S, S);
  },

  /* 浮空岛 72 x 40 */
  makeIsland(scene) {
    const W = 72, H = 40;
    const g = makeGfx(scene);
    g.fillStyle(0xffffff, 1); g.fillRect(0, 0, W, 10);
    g.fillStyle(0xeeeeee, 1); g.fillRect(0, 0, W, 4);
    g.fillStyle(0xdddddd, 1); g.fillRect(0, 10, W, H - 10);
    g.fillStyle(0xcccccc, 1);
    g.fillRect(6, 18, 12, 8); g.fillRect(28, 24, 14, 8); g.fillRect(50, 16, 12, 8);
    bake(g, 'tex_island', W, H);
  },

  /* 岩浆球 30 x 30（保留原色） */
  makeLava(scene) {
    const S = 30, R = S / 2;
    const g = makeGfx(scene);
    g.fillStyle(0xd83a12, 1); g.fillCircle(R, R, R);
    g.fillStyle(0xff7a1a, 1); g.fillCircle(R, R, R - 4);
    g.fillStyle(0xffd23f, 1); g.fillCircle(R, R, R - 9);
    g.fillStyle(0xfff3b0, 1); g.fillCircle(R - 3, R - 3, 3);
    bake(g, 'tex_lava', S, S);
  },

  /* 藤蔓 32 x 32 */
  makeVine(scene) {
    const W = 32, H = 32;
    const g = makeGfx(scene);
    g.fillStyle(0xbbbbbb, 1); g.fillRect(0, 0, W, H);
    g.fillStyle(0xdddddd, 1);
    g.fillRect(2, 2, 11, 13); g.fillRect(18, 5, 12, 11);
    g.fillRect(5, 18, 12, 12); g.fillRect(20, 20, 10, 10);
    g.fillStyle(0xffffff, 1);
    g.fillRect(4, 4, 4, 4); g.fillRect(22, 8, 4, 4);
    g.fillRect(8, 22, 4, 4); g.fillRect(24, 24, 4, 4);
    bake(g, 'tex_vine', W, H);
  },

  /* 敌人：直升机 34 x 26 */
  makeEnemy(scene) {
    const W = 34, H = 26;
    const g = makeGfx(scene);
    g.fillStyle(0x3b4450, 1); g.fillRect(5, 9, 24, 13);
    g.fillStyle(0x5b6675, 1); g.fillRect(7, 11, 20, 9);
    g.fillStyle(0xff4d4d, 1); g.fillRect(26, 13, 7, 5);
    g.fillStyle(0x2a3038, 1);
    g.fillRect(2, 3, 30, 3);
    g.fillRect(16, 6, 3, 3);
    g.fillRect(4, 23, 8, 3); g.fillRect(22, 23, 8, 3);
    g.fillStyle(0x9fd8ff, 1); g.fillRect(10, 13, 6, 5);
    bake(g, 'tex_enemy', W, H);
  },
};
