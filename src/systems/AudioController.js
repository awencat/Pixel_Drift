"use strict";

// One continuous supplied song; only its mix changes between biomes.
class AudioController {
  static profiles = {
    plain:  { volume: 0.34, cutoff: 18000, bass: 0, treble: 1 },
    beach:  { volume: 0.32, cutoff: 16000, bass: -2, treble: 3 },
    forest: { volume: 0.31, cutoff: 9000, bass: 1, treble: -2 },
    cave:   { volume: 0.27, cutoff: 3600, bass: 3, treble: -5 },
    nether: { volume: 0.33, cutoff: 5400, bass: 5, treble: -3 },
    basalt: { volume: 0.29, cutoff: 2600, bass: 4, treble: -6 },
  };
  static effects = {
    click: ['点击.mp3', 0.65], hurt: ['受伤.ogg', 0.7],
    fail: ['失败.mp3', 0.7], collect: ['收集绿宝石.mp3', 0.6],
    helicopter: ['man.mp3', 0.8],
  };
  constructor() {
    this.musicEnabled = true;
    this.effectsEnabled = true;
    try {
      const saved = JSON.parse(localStorage.getItem('pixel-glider-audio') || '{}');
      this.musicEnabled = saved.music !== false;
      this.effectsEnabled = saved.effects !== false;
    } catch (_) { /* Storage may be unavailable in private/restricted browsers. */ }
    this.biome = 'plain';
    this.unlocked = false;
    this.music = new Audio('assets/鹦鹉穿风.mp3');
    this.music.loop = true;
    this.music.preload = 'auto';
    this.music.volume = AudioController.profiles.plain.volume;
    this.pools = {};
    for (const [key, [file, volume]] of Object.entries(AudioController.effects)) {
      this.pools[key] = Array.from({length: 3}, () => {
        const audio = new Audio('assets/样板音效/' + file);
        audio.preload = 'auto'; audio.volume = volume;
        return audio;
      });
    }
    this.onGesture = () => this.unlock();
    this.onVisibility = () => {
      if (document.hidden) { this.music.pause(); this.stopEffects(); }
      else this.startMusic();
    };
    window.addEventListener('pointerdown', this.onGesture, true);
    window.addEventListener('keydown', this.onGesture, true);
    document.addEventListener('visibilitychange', this.onVisibility);
  }
  unlock() {
    this.unlocked = true;
    // Build the Web Audio graph inside a user gesture to respect autoplay rules.
    if (!this.context && !this.graphAttempted) {
      this.graphAttempted = true;
      const Context = window.AudioContext || window.webkitAudioContext;
      if (Context) {
        this.context = new Context();
        this.source = this.context.createMediaElementSource(this.music);
        this.lowpass = this.context.createBiquadFilter(); this.lowpass.type = 'lowpass';
        this.lowpass.Q.value = 0.5;
        this.bass = this.context.createBiquadFilter(); this.bass.type = 'lowshelf';
        this.bass.frequency.value = 240;
        this.treble = this.context.createBiquadFilter(); this.treble.type = 'highshelf';
        this.treble.frequency.value = 2800;
        this.gain = this.context.createGain();
        this.source.connect(this.lowpass).connect(this.bass).connect(this.treble)
          .connect(this.gain).connect(this.context.destination);
        this.music.volume = 1;
        this.setBiome(this.biome, true);
      }
    }
    if (this.context?.state === 'suspended') this.context.resume().catch(() => {});
    this.startMusic();
  }
  startMusic() {
    if (!this.unlocked || !this.musicEnabled || document.hidden || !this.music.paused || this.starting) return;
    this.starting = true;
    this.music.play().catch(() => { /* A subsequent gesture can retry playback. */ })
      .finally(() => { this.starting = false; });
  }
  setBiome(id, immediate = false) {
    this.biome = AudioController.profiles[id] ? id : 'plain';
    const p = AudioController.profiles[this.biome];
    if (!this.context) { this.music.volume = p.volume; return; }
    const now = this.context.currentTime;
    for (const [param, value] of [[this.lowpass.frequency,p.cutoff], [this.bass.gain,p.bass],
      [this.treble.gain,p.treble], [this.gain.gain,p.volume]]) {
      param.cancelScheduledValues(now);
      if (immediate) param.setValueAtTime(value, now);
      else param.setTargetAtTime(value, now, 0.65);
    }
  }
  playSfx(key) {
    if (!this.effectsEnabled || document.hidden || !this.pools[key]) return;
    this.unlock();
    const pool = this.pools[key];
    const sound = pool.find(a => a.paused || a.ended) || pool[0];
    sound.pause(); sound.currentTime = 0;
    sound.play().catch(() => {});
    // Rotate the pool so bursts replace the oldest sound when all slots are busy.
    pool.splice(pool.indexOf(sound), 1); pool.push(sound);
  }
  stopEffects() {
    Object.values(this.pools).flat().forEach(a => { a.pause(); a.currentTime = 0; });
  }
  setMusicEnabled(value) {
    this.musicEnabled = Boolean(value);
    if (this.musicEnabled) this.startMusic(); else this.music.pause();
    this.save();
  }
  setEffectsEnabled(value) {
    this.effectsEnabled = Boolean(value);
    if (!this.effectsEnabled) this.stopEffects();
    this.save();
  }
  save() {
    try { localStorage.setItem('pixel-glider-audio', JSON.stringify({
      music: this.musicEnabled, effects: this.effectsEnabled,
    })); } catch (_) { /* Settings still work for this session. */ }
  }
  destroy() {
    this.music.pause(); this.stopEffects();
    this.context?.close();
    window.removeEventListener('pointerdown', this.onGesture, true);
    window.removeEventListener('keydown', this.onGesture, true);
    document.removeEventListener('visibilitychange', this.onVisibility);
  }
}
