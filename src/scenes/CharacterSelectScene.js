"use strict";

/* =========================================================================
 * [I] CharacterSelectScene —— 角色选择
 * ========================================================================= */

class CharacterSelectScene extends Phaser.Scene {
  constructor() { super('CharacterSelectScene'); }

  create() {
    const cx = GAME_W / 2;
    const cy = GAME_H / 2;

    this.cameras.main.setBackgroundColor('#4a7ea8');
    this.cameras.main.fadeIn(300);

    this.add.tileSprite(0, 0, GAME_W, GAME_H, 'tex_clouds')
      .setOrigin(0).setAlpha(0.35).setTileScale(2, GAME_H / 256);

    this.add.text(cx, 68, '选择你的飞行器', {
      fontFamily: '"Courier New", Consolas, monospace',
      fontSize: '40px', color: '#ffffff', fontStyle: 'bold',
      stroke: '#1b3a57', strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(cx, 112, '不同飞行器拥有不同的飞行手感', {
      fontFamily: '"Courier New", Consolas, monospace',
      fontSize: '16px', color: '#dff3ff',
    }).setOrigin(0.5);

    const keys = Object.keys(CHARACTERS);
    const cardW = 220;
    const cardH = 300;
    const spacing = 250;

    this.cards = [];
    this.locked = false;

    keys.forEach((key, i) => {
      const cfg = CHARACTERS[key];
      const x = cx + (i - (keys.length - 1) / 2) * spacing;
      const y = cy + 30;

      const container = this.add.container(x, y);

      const bg = this.add.rectangle(0, 0, cardW, cardH, 0x24384d)
        .setStrokeStyle(4, 0x8fd3ff)
        .setInteractive({ useHandCursor: true });

      const sprite = this.add.sprite(0, -70, `tex_player_${key}_0`).setScale(4);
      sprite.play('fly_' + key);

      const nameTxt = this.add.text(0, 20, cfg.name, {
        fontFamily: '"Courier New", Consolas, monospace',
        fontSize: '30px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5);

      const descTxt = this.add.text(0, 62, cfg.desc, {
        fontFamily: '"Courier New", Consolas, monospace',
        fontSize: '18px', color: '#9fd8ff',
      }).setOrigin(0.5);

      const statTxt = this.add.text(0, 100,
        `重力 ${cfg.gravityMul.toFixed(2)}×\n冲刺CD ${cfg.dashCdMul.toFixed(2)}×`, {
        fontFamily: '"Courier New", Consolas, monospace',
        fontSize: '14px', color: '#cfe8ff',
        align: 'center', lineSpacing: 4,
      }).setOrigin(0.5);

      container.add([bg, sprite, nameTxt, descTxt, statTxt]);
      container.setSize(cardW, cardH);

      bg.on('pointerover', () => {
        if (this.locked) return;
        bg.setStrokeStyle(6, 0xffe066);
        this.tweens.add({ targets: container, scaleX: 1.04, scaleY: 1.04, duration: 120 });
      });
      bg.on('pointerout', () => {
        if (this.locked) return;
        bg.setStrokeStyle(4, 0x8fd3ff);
        this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 120 });
      });
      bg.on('pointerdown', () => this.selectCharacter(key, container, bg));

      this.cards.push({ key, container, bg, sprite });
    });
  }

  selectCharacter(key, container, bg) {
    if (this.locked) return;
    this.locked = true;

    this.cards.forEach(c => {
      c.bg.disableInteractive();
      if (c.container !== container) {
        this.tweens.add({ targets: c.container, alpha: 0.25, duration: 220 });
      }
    });
    bg.setStrokeStyle(6, 0xffe066);
    this.tweens.add({ targets: container, scaleX: 1.12, scaleY: 1.12, duration: 200, yoyo: true });

    this.time.delayedCall(260, () => {
      this.tweens.add({
        targets: this.cards.filter(c => c.container !== container).map(c => c.container),
        alpha: 0, duration: 200,
      });
      this.tweens.add({ targets: container, alpha: 0, duration: 250 });

      const flyer = this.add.sprite(-80, GAME_H / 2, `tex_player_${key}_0`)
        .setScale(4.5).setDepth(50);
      flyer.play('fly_' + key);

      this.tweens.add({
        targets: flyer,
        x: GAME_W + 100, y: GAME_H / 2 - 60,
        duration: 900, ease: 'Sine.easeInOut',
      });

      this.cameras.main.fadeOut(900, 111, 183, 232);

      this.time.delayedCall(920, () => {
        this.scene.start('GameScene', { character: key });
      });
    });
  }
}
