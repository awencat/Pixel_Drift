# 像素飞行 · Pixel Glider

一个用 **JavaScript + Phaser 3** 写的 2D 横版飞行躲避小游戏。原始版本是单个 HTML 大文件，现已拆分为 `index.html` + `src/` 模块目录 + `assets/` 素材目录。

## 运行

**推荐用本地 HTTP 服务运行**，不需要安装 npm 依赖或构建：

```powershell
python -m http.server 8080 --bind 127.0.0.1
```

打开 [游戏](http://127.0.0.1:8080/index.html) 或 [六群系美术预览](http://127.0.0.1:8080/art-preview.html)。请先在项目目录执行上面的命令。

`index.html` 用普通 `<script>`（非 ES Module）按依赖顺序加载 `src/`。PNG 使用 `HTMLImageElement` 加载，避开 Phaser 默认的 XHR；但不同浏览器对 `file://` 图片上传 WebGL 的限制不同，因此请使用上面的 HTTP 地址测试，不要关闭浏览器安全限制。

只有一点例外：Phaser 3 是从 CDN 加载的，所以**首次运行需要联网**。若要完全离线，把 `phaser.min.js` 下载到本地（如 `vendor/phaser.min.js`），再把 `index.html` 里那行 CDN `<script src>` 换成本地路径即可。

> 也可以使用 VS Code Live Server 或部署到静态托管。

### 加载顺序（重要）

各文件的顶层 `const` / `class` 处于同一个全局词法作用域，互相直接可见——这也是不需要 import/export 的原因。代价是**顺序不能乱**：被依赖的文件必须排在依赖它的文件前面。`index.html` 中每个 `<script>` 上方都注明了该文件依赖谁。

新增模块时请插到正确位置；`src/main.js` 必须始终是最后一个，因为它在加载时就会执行 `new Phaser.Game()`。


## 目录结构

```
index.html                     页面外壳：加载 Phaser CDN，再按依赖顺序加载 src 下各脚本
assets/                        PNG 美术资源、样板图与生成提示词
art-preview.html               独立美术预览：六群系、碰撞框与运行时回归检查
src/
  main.js                      [L] 入口：PhaserConfig + new Phaser.Game()
  style.css                    页面样式
  config/
    constants.js               [A] 画布尺寸 / 地面高度 / ★ TUNING 全部可调参数
    characters.js              [B] CHARACTERS 三个角色数值
    biomes.js                  [C] Biome 类 + BIOMES 六个生物群系
  utils/
    helpers.js                 [D] makeGfx / bake / shadeColor / makeButton
  gfx/
    TextureFactory.js          [E] 仅生成原有玩家和拾取物贴图
    ArtAssets.js               [E] PNG 加载清单、群系映射与怪物动画
  entities/                    [F] 实体系统（一文件一类）
    Entity.js                  基类：位置、速度、包围盒、回收
    WallEntity.js              墙式障碍
    FloaterEntity.js           自由障碍（浮空岛 / 漂浮岩浆）
    VineEntity.js              脆弱障碍（藤蔓，可被冲刺击碎）
    EnemyEntity.js             敌人（直升机会追踪玩家高度）
    ProjectileEntity.js        抛物线抛射物
    EmeraldEntity.js           绿宝石
  systems/
    BackgroundManager.js       [G] 六群系循环全景 + 独立滚动地面 / 洞顶
    SpawnManager.js            [H] 按生物群系权重生成障碍 / 宝石
  scenes/
    BootScene.js               [I] 生成贴图、注册 fly_* 动画
    MenuScene.js               [I] 主菜单
    CharacterSelectScene.js    [I] 选角界面
    GameScene.js               [J] 核心玩法主循环
    GameOverScene.js           [K] 结算界面
```

## 玩法

- **鼠标点击 / 触摸屏幕** —— 上升（风筝式物理，有惯性和风扰）
- **空格** —— 冲刺（短暂无敌，可击碎藤蔓和敌人、加分）
- **P** —— 暂停 / 继续

撞到墙体、浮空岛、岩浆会扣 1 点生命（受伤后 1.5 秒无敌，撞地也会扣血）。吃绿宝石 +10 分，冲刺击碎脆弱障碍 / 敌人 +15 分，飞行距离也计分。

每 30 秒切换一次生物群系（平原 → 海边 → 森林 → 洞穴 → 下界荒地 → 玄武岩三角洲，循环），不同群系的天空 / 地面配色、障碍类型权重、生成密度都不同，难度递增。

## 调参

所有可调数值集中在 **`src/config/constants.js` → `TUNING`**，每项都有中文注释：

- `TUNING.world` —— 卷轴速度、加速时间点（`accelStartTime`，改成 120 即 2 分钟后才开始加速）、视差系数
- `TUNING.flight` —— 重力、空气阻尼、拍翅冲量、风力
- `TUNING.dash` —— 冲刺冷却 / 时长 / 倍率
- `TUNING.spawn` —— 生成间隔衰减、障碍概率曲线
- `TUNING.score` —— 各类得分
- `TUNING.health` —— 生命上限、无敌时间
- `TUNING.biome` —— 群系持续时长、过场淡入淡出

角色数值在 `src/config/characters.js`，生物群系在 `src/config/biomes.js`。

## 替换美术资源

背景、墙体、脆弱障碍、浮岛、怪物和抛射物已替换为 Minecraft 风格 PNG。玩家、绿宝石和生命水晶沿用原有工厂；本次替换部分的工厂调用已停用。规格、材质对应关系、动画和验证方式见 [`assets/README.md`](assets/README.md)。

静态检查：`node tests/art-contract.cjs`。运行时检查：打开美术预览页的「资源与行为验证」，涵盖材质切换、原有碰撞框、恶魂发射时机、火球反弹速度和抛物线轨迹。

## 原始文件

`deepseek_html_20260910_8f659b.html` 是拆分前的单文件版本，保留作为对照，确认新版没问题后可以删除。
