"use strict";
// Team-facing audition controls, never loaded in the game.
const previewAudio = new AudioController();
const previewMusicButton = document.querySelector('#music-preview');
const audioStatus = document.querySelector('#audio-status');
let auditionStarted = false;
const previewEffects = document.querySelector('#preview-effects');
previewEffects.checked = previewAudio.effectsEnabled;
previewMusicButton.addEventListener('click', () => {
  if (!auditionStarted) { auditionStarted = true; previewAudio.setMusicEnabled(true); previewAudio.unlock(); }
  else previewAudio.setMusicEnabled(!previewAudio.musicEnabled);
  previewMusicButton.textContent = previewAudio.musicEnabled ? '暂停音乐' : '播放音乐';
});
previewEffects.addEventListener('change', () => previewAudio.setEffectsEnabled(previewEffects.checked));
for (const [key, label] of [['click','点击'],['hurt','受伤'],['fail','失败'],['collect','收集绿宝石'],['helicopter','直升机击毁 · man']]) {
  const button = document.createElement('button'); button.textContent = label;
  button.onclick = () => { previewAudio.playSfx(key); audioStatus.textContent = previewAudio.effectsEnabled ? '试听：'+label : '音效已关闭'; };
  document.querySelector('#sound-buttons').append(button);
}
// Expose real native media controls/status in the team preview for playback verification.
previewAudio.music.controls = true;
previewAudio.music.setAttribute('aria-label','鹦鹉穿风音乐播放器');
document.querySelector('#audio-media').append(previewAudio.music);
for (const [key, pool] of Object.entries(previewAudio.pools)) {
  pool.forEach(sound => {
    sound.setAttribute('data-sound',key);
    sound.addEventListener('error', () => { audioStatus.textContent='音效加载失败：'+key; });
    document.querySelector('#audio-media').append(sound);
  });
}
previewAudio.music.addEventListener('playing', () => { audioStatus.textContent = '音乐播放中 · 群系：'+previewAudio.biome; });
previewAudio.music.addEventListener('error', () => { audioStatus.textContent = '音乐加载失败，请检查 HTTP 服务和文件路径。'; });
