"use strict";

/* =========================================================================
 * [K] GameOverScene
 * ========================================================================= */

class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  init(data) {
    this.finalScore = data.score || 0;
    this.character = data.character || 'blue';
  }

  create() {
    const cx = GAME_W / 2;
    const cy = GAME_H / 2;

    this.add.rectangle(cx, cy, GAME_W, GAME_H, 0x000000, 0.6);

    const panel = this.add.rectangle(cx, cy, 480, 360, 0x1e3247)
      .setStrokeStyle(6, 0x8fd3ff);
    panel.setScale(0.6);
    this.tweens.add({
      targets: panel, scaleX: 1, scaleY: 1,
      duration: 260, ease: 'Back.easeOut',
    });

    makeText(this, cx, cy - 130, '游戏结束', {
      fontFamily: '"Courier New", Consolas, monospace',
      fontSize: '46px', color: '#ff6b6b', fontStyle: 'bold',
      stroke: '#2a0d0d', strokeThickness: 8,
    }).setOrigin(0.5);

    makeText(this, cx, cy - 46, '最终分数', {
      fontFamily: '"Courier New", Consolas, monospace',
      fontSize: '20px', color: '#9fd8ff',
    }).setOrigin(0.5);

    const scoreTxt = makeText(this, cx, cy + 4, '0', {
      fontFamily: '"Courier New", Consolas, monospace',
      fontSize: '60px', color: '#ffffff', fontStyle: 'bold',
      stroke: '#12314a', strokeThickness: 8,
    }).setOrigin(0.5);

    this.tweens.addCounter({
      from: 0, to: this.finalScore, duration: 700, ease: 'Cubic.easeOut',
      onUpdate: (tw) => scoreTxt.setText(String(Math.floor(tw.getValue()))),
    });

    makeButton(this, cx - 110, cy + 118, '重新开始', () => {
      this.scene.stop('GameScene');
      this.scene.start('GameScene', { character: this.character });
    }, { width: 190, height: 60, color: 0x2e7d32, fontSize: '22px' });

    makeButton(this, cx + 110, cy + 118, '主菜单', () => {
      this.scene.stop('GameScene');
      this.scene.start('MenuScene');
    }, { width: 190, height: 60, color: 0x37474f, fontSize: '22px' });
  }
}
