"use strict";

// Logical gameplay remains 960x540; the backing canvas follows display density.
const RenderQuality = {
  scale() {
    const fit = Math.min(window.innerWidth / GAME_W, window.innerHeight / GAME_H);
    return Math.max(1, Math.min(4, Math.ceil(fit * (window.devicePixelRatio || 1))));
  },
  install(game) {
    const resize = () => {
      const scale = this.scale();
      if (game.renderScale === scale) return;
      game.renderScale = scale;
      game.scale.resize(GAME_W * scale, GAME_H * scale);
      const refresh = list => list.forEach(object => {
        if (object.type === 'Text') object.setResolution(scale);
        if (object.type === 'Container') refresh(object.list);
      });
      game.scene.scenes.forEach(scene => { if (scene.children) refresh(scene.children.list); });
    };
    resize();
    const cameras = () => {
      resize(); // Also handles moving the window between monitors with different DPR.
      for (const scene of game.scene.getScenes(true)) {
        scene.cameras.main.setOrigin(0, 0).setZoom(game.renderScale);
      }
    };
    game.events.on('poststep', cameras);
    game.events.once('destroy', () => game.events.off('poststep', cameras));
  },
};

function makeText(scene, x, y, text, style) {
  return scene.add.text(x, y, text, {
    ...style,
    fontFamily: '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif',
    resolution: scene.game.renderScale || RenderQuality.scale(),
  });
}
