"use strict";

/* =========================================================================
 * [L] 启动游戏
 * ========================================================================= */

const PhaserConfig = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: GAME_W,
  height: GAME_H,
  backgroundColor: '#6fb7e8',
  pixelArt: true,
  roundPixels: true,
  callbacks: { postBoot: game => RenderQuality.install(game) },
  audio: { noAudio: true }, // AudioController owns the single audio context.
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: { debug: false, gravity: { y: 0 } },
  },
  scene: [
    BootScene,
    MenuScene,
    CharacterSelectScene,
    GameScene,
    GameOverScene,
  ],
};

window.pixelGliderGame = new Phaser.Game(PhaserConfig);
