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
    this.musicVolume = 1;
    this.effectsVolume = 1;
    this.effectEpoch = 0;
    this.activeSources = new Set();
    this.buffers = {};
    try {
      const saved = JSON.parse(localStorage.getItem('pixel-glider-audio') || '{}');
      this.musicEnabled = saved.music !== false;
      this.effectsEnabled = saved.effects !== false;
      this.musicVolume = AudioController.volume(saved.musicVolume);
      this.effectsVolume = AudioController.volume(saved.effectsVolume);
    } catch (_) { /* Storage may be unavailable in private/restricted browsers. */ }
    this.biome = 'plain';
    this.unlocked = false;
    this.music = new Audio(this.asset('assets/鹦鹉穿风.mp3'));
    this.music.loop = true;
    this.music.preload = 'auto';
    this.music.volume = AudioController.profiles.plain.volume * this.musicVolume;
    this.pools = {};
    for (const [key, [file, volume]] of Object.entries(AudioController.effects)) {
      this.pools[key] = Array.from({length: 3}, () => {
        const audio = new Audio(this.asset('assets/样板音效/' + file));
        audio.preload = 'auto'; audio.volume = volume * this.effectsVolume;
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
  static volume(value) { return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 1; }
  asset(path) { return window.GAME_ASSETS?.[path] || path; }
  unlock() {
    this.unlocked = true;
    // Build the Web Audio graph inside a user gesture to respect autoplay rules.
    if (!this.context && !this.graphAttempted) {
      this.graphAttempted = true;
      const Context = window.AudioContext || window.webkitAudioContext;
      if (Context) try {
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
      } catch (error) {
        // Keep native playback available if Web Audio cannot be initialized.
        this.context?.close();
        this.context = null;
        this.music = new Audio(this.asset('assets/鹦鹉穿风.mp3'));
        this.music.loop = true;
        this.setBiome(this.biome, true);
        console.warn('Web Audio unavailable; using native audio.', error);
      }
    }
    if (this.context?.state === 'suspended') this.context.resume().catch(error => console.warn('Audio resume failed', error));
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
    if (!this.context) { this.music.volume = p.volume * this.musicVolume; return; }
    const now = this.context.currentTime;
    for (const [param, value] of [[this.lowpass.frequency,p.cutoff], [this.bass.gain,p.bass],
      [this.treble.gain,p.treble], [this.gain.gain,p.volume * this.musicVolume]]) {
      param.cancelScheduledValues(now);
      if (immediate) param.setValueAtTime(value, now);
      else param.setTargetAtTime(value, now, 0.65);
    }
  }
  playSfx(key) {
    if (!this.effectsEnabled || document.hidden || !this.pools[key]) return;
    this.unlock();
    // One gesture unlocks the context for all later game events (including Safari).
    // Decode embedded bytes directly: file:// never needs fetch or XHR.
    const uri = this.asset('assets/样板音效/' + AudioController.effects[key][0]);
    if (this.context?.decodeAudioData && uri.startsWith('data:')) {
      const epoch = this.effectEpoch;
      if (!this.buffers[key]) {
        const bytes = Uint8Array.from(atob(uri.split(',')[1]), c => c.charCodeAt(0));
        this.buffers[key] = this.context.decodeAudioData(bytes.buffer);
      }
      this.buffers[key].then(buffer => {
        if (epoch !== this.effectEpoch || !this.effectsEnabled || document.hidden) return;
        const source = this.context.createBufferSource();
        const gain = this.context.createGain();
        source.buffer = buffer;
        gain.gain.value = AudioController.effects[key][1] * this.effectsVolume;
        source.connect(gain).connect(this.context.destination);
        const entry = {source, gain, key};
        this.activeSources.add(entry);
        source.onended = () => { this.activeSources.delete(entry); source.disconnect(); gain.disconnect(); };
        source.start();
      }).catch(error => console.warn('Unable to decode sound: ' + key, error));
      return;
    }
    const pool = this.pools[key];
    const sound = pool.find(a => a.paused || a.ended) || pool[0];
    sound.pause(); sound.currentTime = 0;
    sound.play().catch(() => {});
    // Rotate the pool so bursts replace the oldest sound when all slots are busy.
    pool.splice(pool.indexOf(sound), 1); pool.push(sound);
  }
  stopEffects() {
    this.effectEpoch++;
    for (const {source} of this.activeSources) source.stop();
    this.activeSources.clear();
    Object.values(this.pools).flat().forEach(a => { a.pause(); a.currentTime = 0; });
  }
  setMusicVolume(value) {
    this.musicVolume = AudioController.volume(value);
    this.setBiome(this.biome, true);
    this.save();
  }
  setEffectsVolume(value) {
    this.effectsVolume = AudioController.volume(value);
    for (const [key, pool] of Object.entries(this.pools)) {
      pool.forEach(sound => { sound.volume = AudioController.effects[key][1] * this.effectsVolume; });
    }
    for (const {gain, key} of this.activeSources) gain.gain.value = AudioController.effects[key][1] * this.effectsVolume;
    this.save();
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
      musicVolume: this.musicVolume, effectsVolume: this.effectsVolume,
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
