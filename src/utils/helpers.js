"use strict";

/* =========================================================================
 * [D] 工具函数
 * ========================================================================= */

/** 创建离屏 Graphics */
function makeGfx(scene) {
  return scene.make.graphics({ x: 0, y: 0, add: false });
}

/** 把 Graphics 烘焙成纹理并销毁 */
function bake(g, key, w, h) {
  g.generateTexture(key, w, h);
  g.destroy();
}

/** 颜色明暗调整 */
function shadeColor(hex, amount) {
  const c = Phaser.Display.Color.IntegerToColor(hex);
  const r = Phaser.Math.Clamp(c.red + amount, 0, 255);
  const g = Phaser.Math.Clamp(c.green + amount, 0, 255);
  const b = Phaser.Math.Clamp(c.blue + amount, 0, 255);
  return Phaser.Display.Color.GetColor(r, g, b);
}

/** 通用像素风按钮 */
function makeButton(scene, x, y, label, onClick, opts = {}) {
  const w = opts.width || 240;
  const h = opts.height || 64;
  const base = opts.color !== undefined ? opts.color : 0x2e7d32;
  const hover = shadeColor(base, 32);
  const press = shadeColor(base, -28);
  const fontSize = opts.fontSize || '28px';

  const bg = scene.add.rectangle(x, y, w, h, base)
    .setStrokeStyle(4, shadeColor(base, -60))
    .setInteractive({ useHandCursor: true });

  const txt = makeText(scene, x, y, label, {
    fontFamily: '"Courier New", Consolas, monospace',
    fontSize, color: '#ffffff', fontStyle: 'bold',
  }).setOrigin(0.5);

  bg.on('pointerover', () => bg.setFillStyle(hover));
  bg.on('pointerout',  () => bg.setFillStyle(base));
  bg.on('pointerdown', () => {
    scene.game.audioController?.playSfx('click');
    bg.setFillStyle(press);
    scene.tweens.add({ targets: [bg, txt], scaleX: 0.94, scaleY: 0.94, duration: 70, yoyo: true });
    scene.time.delayedCall(90, () => { bg.setFillStyle(base); onClick(); });
  });

  return { bg, txt };
}
