"use strict";

// Native modal dialog supplies keyboard focus containment and blocks canvas input.
class SettingsUI {
  constructor(game, audio) {
    this.game = game; this.audio = audio;
    this.button = document.querySelector('#settings-button');
    this.dialog = document.querySelector('#settings-dialog');
    this.music = document.querySelector('#music-enabled');
    this.effects = document.querySelector('#effects-enabled');
    this.button.hidden = false;
    this.music.checked = audio.musicEnabled;
    this.effects.checked = audio.effectsEnabled;
    this.button.addEventListener('click', () => this.open());
    document.querySelector('#settings-close').addEventListener('click', () => this.close());
    this.dialog.addEventListener('cancel', e => { e.preventDefault(); this.close(); });
    this.dialog.addEventListener('click', e => { if (e.target === this.dialog) this.close(); });
    this.dialog.addEventListener('keydown', e => e.stopPropagation());
    this.music.addEventListener('change', () => {
      audio.setMusicEnabled(this.music.checked); audio.playSfx('click');
    });
    this.effects.addEventListener('change', () => {
      audio.setEffectsEnabled(this.effects.checked); audio.playSfx('click');
    });
  }
  get isOpen() { return this.dialog.open; }
  open() {
    if (this.isOpen) return;
    this.audio.playSfx('click');
    // Freeze transition timers too: character selection must not start gameplay
    // behind a modal. Record only active scenes to preserve any pre-existing pause.
    this.pausedScenes = this.game.scene.getScenes(true).map(scene => scene.sys.settings.key);
    for (const key of this.pausedScenes) this.game.scene.pause(key);
    this.dialog.showModal();
  }
  close() {
    if (!this.isOpen) return;
    this.audio.playSfx('click');
    this.dialog.close();
    for (const key of this.pausedScenes) {
      if (this.game.scene.isPaused(key)) this.game.scene.resume(key);
    }
    this.pausedScenes = [];
    this.button.focus();
  }
}
