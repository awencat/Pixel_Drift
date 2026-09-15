"use strict";

/* =========================================================================
 * [G] 背景管理器
 * ========================================================================= */

class BackgroundManager {
  constructor(scene) {
    this.scene = scene;

    this.bgFar = scene.add.tileSprite(0, 0, GAME_W, GROUND_Y, 'tex_background_plain')
      .setOrigin(0).setDepth(1).setTileScale(2);

    this.ground = scene.add.tileSprite(0, GROUND_Y, GAME_W, GROUND_H, 'tex_ground_plain')
      .setOrigin(0).setDepth(3).setTileScale(2);

    /* ---- 天花板（仅封顶群系显示） ---- */
    this.ceiling = scene.add.tileSprite(0, 0, GAME_W, 28, 'tex_wall_cave')
      .setOrigin(0).setDepth(4).setTileScale(2).setVisible(false);
  }

  applyBiome(biome, instant) {
    this.bgFar.setTexture(ArtAssets.biomeKey('background', biome));
    this.ground.setTexture(ArtAssets.biomeKey('ground', biome));
    this.scene.cameras.main.setBackgroundColor(biome.skyColor);

    const capped = !!biome.capped;
    this.ceiling.setVisible(capped);
    if (capped) {
      this.ceiling.setTexture(ArtAssets.biomeKey('wall', biome));
    }
  }

  update(dt, scrollSpeed) {
    this.bgFar.tilePositionX  += scrollSpeed * TUNING.world.bgFarFactor  * dt;
    this.ground.tilePositionX += scrollSpeed * dt;
    this.ceiling.tilePositionX += scrollSpeed * dt;
  }
}
