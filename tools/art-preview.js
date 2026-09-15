"use strict";

// Isolated art review scene. This file is never loaded by index.html.
class ArtPreviewScene extends Phaser.Scene {
  constructor() { super('ArtPreview'); }
  preload() { ArtAssets.preload(this); }
  create() {
    ArtAssets.createAnimations(this);
    this.entities = [];
    this.playerX = 120; this.playerY = 320;
    this.bg = new BackgroundManager(this);
    this.boxes = this.add.graphics().setDepth(100);
    for (const [i, biome] of BIOMES.entries()) {
      const button = document.createElement('button');
      button.textContent = biome.name;
      button.onclick = () => this.selectBiome(i);
      document.querySelector('#biomes').append(button);
    }
    this.selectBiome(0);
    this.verify();
  }
  selectBiome(index) {
    this.entities.forEach(e => e.kill());
    this.entities = [];
    this.biome = BIOMES[index];
    this.bg.applyBiome(this.biome, true);
    this.bg.bgFar.tilePositionX = 0;
    document.querySelectorAll('#biomes button').forEach((b,i) => b.setAttribute('aria-pressed', String(i===index)));
    const materials = ['土块 / 藤蔓 / 草覆岩石', '砂岩 / 沙石锥 / 砂岩浮岛', '橡木 / 藤蔓 / 苔石浮岛', '石头 / 缠根滴水石锥 / 洞穴岩石', '下界岩与岩浆块 / 下界岩石锥 / 下界岩浮岛', '玄武岩与岩浆块 / 玄武岩石锥 / 玄武岩浮岛'];
    document.querySelector('#caption').textContent = this.biome.name + '：' + materials[index];
    this.entities.push(new WallEntity(this,90,true,166,66), new WallEntity(this,90,false,170,66),
      new VineEntity(this,250,148,40,296), new FloaterEntity(this,440,408,'tex_island',120,60),
      new BeeEntity(this,410,225),new BatEntity(this,478,225),new PhantomEntity(this,550,225),
      new GlowEntity(this,620,225),new EnemyEntity(this,690,225));
    this.ghast = new GhastEntity(this,800,140,{firstFire:1.2});
    this.entities.push(this.ghast);
    for (const [i, tex] of ['tex_stone','tex_lava','tex_fireball','tex_bullet'].entries()) {
      this.entities.push(new ProjectileEntity(this,500+i*72,335,tex,tex==='tex_bullet'?14:36,tex==='tex_bullet'?10:36,0,0,0));
    }
  }
  verify() {
    const checks = [];
    const check = (ok, text) => { if(!ok) throw Error(text); checks.push('PASS '+text); };
    try {
      check(ArtAssets.images.every(({key}) => this.textures.exists(key)), '全部 '+ArtAssets.images.length+' 个纹理 key 已加载，无缺图');
      const w=this.entities[0];
      check(w.rect().width===66 && w.rect().height===166 && w.y===83, '墙体碰撞框与定位不变');
      const v=this.entities[2];
      check(v.breakable && v.rect().width===40 && v.rect().height===296, '脆弱障碍仍可冲刺击碎，碰撞框不变');
      const g=new GhastEntity(this,800,160,{firstFire:0.2});
      const before=this.entities.length;
      g.update(0.19,180);
      check(this.entities.length===before && g.sprite.texture.key==='tex_ghast_charge', '恶魂仅改变蓄力表情，没有提前发射');
      g.update(0.02,180);
      check(this.entities.length===before+1 && g.timer===2.4 && g.sprite.texture.key==='tex_ghast_fire', '恶魂按原计时发射，吐火帧同步');
      const shot=this.entities.pop();
      check(Math.abs(Math.hypot(shot.fx,shot.fy)-300)<0.001 && shot.w===40 && shot.h===40, '火球原速度 300、碰撞尺寸 40×40');
      shot.rebound();
      check(shot.reversed && Math.abs(Math.hypot(shot.fx,shot.fy)-760)<0.001, '冲刺反弹速度仍为 760');
      shot.kill(); g.kill();
      const p=new ProjectileEntity(this,400,200,'tex_stone',36,36,-300,-200,420,{type:'stone',breakable:true});
      p.update(0.1,180);
      check(p.x===352 && Math.abs(p.y-184.2)<0.001 && p.breakable, '抛物线速度、重力、可破坏属性不变');
      p.kill();
      for(const biome of BIOMES) {
        w.applyBiome(biome); v.applyBiome(biome); this.entities[3].applyBiome(biome);
        check(w.tiles.displayTexture.key.endsWith(biome.id) && v.sprite.texture.key.endsWith(biome.id) && this.entities[3].sprite.texture.key.endsWith(biome.id), biome.name+' 的现存障碍材质可切换');
      }
      [w,v,this.entities[3]].forEach(e=>e.applyBiome(this.biome));
      document.querySelector('#checks').textContent=checks.join('\n');
    } catch(e) { document.querySelector('#checks').textContent=checks.join('\n')+'\nFAIL '+e.message; console.error(e); }
  }
  update(time,delta) {
    if(!this.ghast) return;
    const dt=Math.min(delta/1000,1/30);
    if(document.querySelector('#scroll').checked) this.bg.update(dt,80);
    this.ghast.update(dt,0);
    for(const entity of this.entities) {
      if(entity.kind==='fireball') {entity.update(dt,0); if(entity.offscreen()) entity.kill();}
      if(entity.kind==='projectile') entity.sprite.angle+=dt*60;
    }
    this.entities=this.entities.filter(e=>!e.dead);
    this.boxes.clear();
    if(document.querySelector('#bounds').checked) {
      this.boxes.lineStyle(1,0xffe181,0.85);
      this.entities.forEach(e=>this.boxes.strokeRectShape(e.rect()));
    }
  }
}
new Phaser.Game({type:Phaser.AUTO,parent:'preview',width:GAME_W,height:GAME_H,pixelArt:true,roundPixels:true,
  scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[ArtPreviewScene]});
