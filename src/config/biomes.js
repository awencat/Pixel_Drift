"use strict";

/* =========================================================================
 * [C] 生物群系数据
 * ========================================================================= */

class Biome {
  constructor(cfg) {
    this.id = cfg.id;
    this.name = cfg.name;
    this.skyColor = cfg.skyColor;
    this.cloudTint = cfg.cloudTint;
    this.hillTint = cfg.hillTint;
    this.groundTint = cfg.groundTint;
    this.grassTint = cfg.grassTint;
    this.wallTint = cfg.wallTint || 0xdddddd;
    this.obstacleWeights = cfg.obstacleWeights;
    this.spawnIntervalMul = cfg.spawnIntervalMul !== undefined ? cfg.spawnIntervalMul : 1;
    this.obstacleWeightBonus = cfg.obstacleWeightBonus || 0;
    this.capped = cfg.capped || false;
    this.duration = cfg.duration || TUNING.biome.duration;
  }
}

const BIOMES = [
  // 1. 平原 —— 最温和
  new Biome({
    id: 'plain', name: '平原',
    skyColor: 0x87ceeb,
    cloudTint: 0xffffff,
    hillTint: 0x7aae54,
    groundTint: 0x9c7040,
    grassTint: 0x5db03c,
    wallTint: 0xcfcfcf,
    obstacleWeights: { wall: 6, free: 3, vine: 1, enemy: 1, projectile: 0 },
    spawnIntervalMul: 1.00,
    obstacleWeightBonus: 0.00,
  }),

  // 2. 海边 —— 开阔
  new Biome({
    id: 'beach', name: '海边',
    skyColor: 0x6ec6f5,
    cloudTint: 0xffffff,
    hillTint: 0x3a9ad9,
    groundTint: 0xe0c88a,
    grassTint: 0xf2dfa8,
    wallTint: 0xe8d9a0,
    obstacleWeights: { wall: 5, free: 4, vine: 1, enemy: 2, projectile: 1 },
    spawnIntervalMul: 1.00,
    obstacleWeightBonus: 0.02,
  }),

  // 3. 森林 —— 藤蔓增多
  new Biome({
    id: 'forest', name: '森林',
    skyColor: 0x7ab87a,
    cloudTint: 0xd8f0d8,
    hillTint: 0x3d6b30,
    groundTint: 0x5a4a2f,
    grassTint: 0x3d8a3d,
    wallTint: 0x6f8a4a,
    obstacleWeights: { wall: 5, free: 3, vine: 2, enemy: 1, projectile: 1 },
    spawnIntervalMul: 0.95,
    obstacleWeightBonus: 0.04,
  }),

  // 4. 洞穴 —— 抛射物变多
  new Biome({
    id: 'cave', name: '洞穴',
    skyColor: 0x2a2a3e,
    cloudTint: 0x4a4a5c,
    hillTint: 0x3a3a4a,
    groundTint: 0x5a5a5a,
    grassTint: 0x6a6a6a,
    wallTint: 0x9a9a9a,
    obstacleWeights: { wall: 6, free: 2, vine: 2, enemy: 1, projectile: 3 },
    spawnIntervalMul: 0.90,
    obstacleWeightBonus: 0.06,
    capped: true,
  }),

  // 5. 下界荒地 —— 敌人密集
  new Biome({
    id: 'nether', name: '下界荒地',
    skyColor: 0x6b1414,
    cloudTint: 0x8a2020,
    hillTint: 0x4a1010,
    groundTint: 0x5a1a1a,
    grassTint: 0x8a2525,
    wallTint: 0x8a3030,
    obstacleWeights: { wall: 4, free: 4, vine: 2, enemy: 3, projectile: 3 },
    spawnIntervalMul: 0.85,
    obstacleWeightBonus: 0.08,
    capped: true,
  }),

  // 6. 玄武岩三角洲 —— 最难
  new Biome({
    id: 'basalt', name: '玄武岩三角洲',
    skyColor: 0xd3d3d3,
    cloudTint: 0x4a4a5a,
    hillTint: 0xffa500,
    groundTint: 0x3a3a42,
    grassTint: 0xd4d4ff,
    wallTint: 0x6a6a78,
    obstacleWeights: { wall: 5, free: 3, vine: 3, enemy: 3, projectile: 3 },
    spawnIntervalMul: 0.80,
    obstacleWeightBonus: 0.10,
    capped: true,
  }),
];
