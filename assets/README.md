# PNG 美术资源

## 已接入内容

50 张 PNG 共约 **1.05 MiB**，单张最大约 **190 KiB**；运行时加载 53 个纹理 key（部分 key 复用同一个文件）。所有资源均在 `assets/art/`，无需生成工具即可运行。

| 群系 | 墙体 | 脆弱障碍 | 浮岛 |
| --- | --- | --- | --- |
| 平原 plain | 土块，草边 | 绿色藤蔓 | 草覆岩石 |
| 海边 beach | 砂岩，沙面 | 向下沙石锥 | 砂岩 |
| 森林 forest | 橡木树皮，端面年轮 | 深绿藤蔓 | 苔石 |
| 洞穴 cave | 石头 | 缠根及向下滴水石锥 | 洞穴岩石 |
| 下界荒地 nether | 下界岩与岩浆块 | 下界岩石锥 | 下界岩 |
| 玄武岩三角洲 basalt | 玄武岩与岩浆块 | 玄武岩石锥 | 玄武岩 |

背景为各群系独立的彩色场景，全景和前景地面分别滚动。原有群系计时与过场保持不变；现存墙体、藤蔓／石锥和浮岛在切换时同步换材质。

## 文件及尺寸

- `background_<biome>.png`：1024 × 256，128 色，左右镜像拼接保证循环接缝一致；采用 2 的幂尺寸，避免 Phaser TileSprite 内部插值。
- `material_*.png`：32 × 32，墙面按 2 倍尺寸平铺，高墙不拉伸纹理；还保留独立土块、下界岩、岩浆块、玄武岩等素材供后续使用。
- `vine_<biome>.png`：32 × 160，透明 PNG，按原障碍尺寸显示，方向向下。
- `island_<biome>.png`：80 × 40，透明 PNG，按原 120 × 60 显示。
- `bee*.png`、`bat*.png`、`phantom*.png`、`glow*.png`：40 × 32，双帧动画。
- `ghast.png`、`ghast_charge.png`、`ghast_fire.png`：64 × 64，待机／红眼张嘴／吐火三个状态。
- `enemy.png`：48 × 36，铁与铜、红石风格直升机。
- `stone.png`、`lava.png`、`fireball.png`、`bullet.png`：32 × 32，落石、熔岩、恶魂火球、荧光子弹。

PNG 透明度已量化为清晰边缘，游戏开启 `pixelArt` 和 `roundPixels`。实体碰撞尺寸继续取原有 `w/h`，不从 PNG 的透明轮廓推导碰撞。

## 接入位置

- `src/gfx/ArtAssets.js`：资源清单、材质映射、图片加载、循环动画、恶魂表情选择。
- `src/scenes/BootScene.js`：预加载 PNG，注册动画。
- `src/gfx/TextureFactory.js`：仅继续生成玩家、绿宝石、生命水晶；本次替换部分的旧工厂调用已停用。
- `WallEntity`：平铺材质及顶部／底部材质边缘。
- `VineEntity`、`FloaterEntity`：按群系选择 PNG。
- `GhastEntity`：发射前 0.55 秒蓄力表情、发射后 0.18 秒吐火表情；原发射计时与弹道不变。
- `BackgroundManager`：彩色 PNG 全景、地面及洞顶，无旧占位纹理染色。

## 运行与检查

在项目根目录：

```powershell
python -m http.server 8080 --bind 127.0.0.1
```

- [游戏](http://127.0.0.1:8080/index.html)
- [六群系美术预览](http://127.0.0.1:8080/art-preview.html)：可切群系、关闭滚动、显示原有碰撞框；展开「资源与行为验证」查看真实 Phaser 实例中的回归结果。
- `node tests/art-contract.cjs`：检查六群系资源覆盖、PNG 格式、尺寸、体积、重复 key 和恶魂视觉状态。

图片通过 Phaser 3.70 的 `load.imageLoadType = 'HTMLImageElement'` 加载，避开默认 XHR。浏览器仍可能限制 `file://` 的 WebGL 纹理读取；**测试请使用 HTTP 地址，不要关闭浏览器安全设置**。Phaser 仍使用项目原有 CDN，因此首次运行需要联网。

## 来源与再次生成

素材由 **内置 ImageGen** 生成，风格参考用户提供的 `assets/样板图片.png`，材质类型参考 [MC Assets 26.2](https://mcasset.cloud/26.2/)。没有将 MC 官方贴图直接打包进项目。

完整提示词保存在 [PROMPTS.md](PROMPTS.md)。`tools/import-art.cjs` 用 Sharp 对生成图集切片、裁边、最近邻缩放、透明度及调色板压缩；这只是离线导出步骤，游戏不会运行它。重新导出时需安装 Sharp，并向脚本传入原始 ImageGen 图集目录（文件名见脚本）。正常修改游戏只需直接替换 `assets/art/` 中对应 PNG。
