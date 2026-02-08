import Phaser from 'phaser';
import './style.css';
import { gameConfig } from './game/config.js';
import BootScene from './game/scenes/BootScene.js';
import GameScene from './game/scenes/GameScene.js';

document.querySelector('#app').innerHTML = `
  <div class="app-shell">
    <header class="hud">
      <div class="brand">
        <div class="title">Pixel Dev Quest</div>
        <div class="subtitle">A cozy top-down pixel village. Try talking with the people.</div>
      </div>
      <button class="music-toggle" id="music-toggle" aria-pressed="true" aria-label="Toggle music" title="Turn off music">
        <span class="music-icon" aria-hidden="true">♪</span>
      </button>
      <div class="controls">
        <span>Move: <strong>W/A/S/D</strong></span>
        <span>Attack: <strong>J</strong></span>
        <span>Arrow: <strong>K</strong></span>
        <span>Restart: <strong>R</strong></span>
      </div>
    </header>
    <div class="stage">
      <div id="game"></div>
    </div>
  </div>
`;

const config = {
  ...gameConfig,
  scene: [BootScene, GameScene],
};

const game = new Phaser.Game(config);

const musicToggleButton = document.querySelector('#music-toggle');
const initialMusicEnabled = window.localStorage?.getItem('musicEnabled') !== 'false';

const updateMusicToggle = (enabled) => {
  if (!musicToggleButton) return;
  musicToggleButton.setAttribute('aria-pressed', String(enabled));
  musicToggleButton.classList.toggle('is-off', !enabled);
  musicToggleButton.title = enabled ? 'Turn off music' : 'Turn on music';
};

updateMusicToggle(initialMusicEnabled);
game.events.emit('music:toggle', initialMusicEnabled);

if (musicToggleButton) {
  musicToggleButton.addEventListener('click', () => {
    const isEnabled = musicToggleButton.getAttribute('aria-pressed') === 'true';
    const next = !isEnabled;
    window.localStorage?.setItem('musicEnabled', String(next));
    updateMusicToggle(next);
    game.events.emit('music:toggle', next);
  });
}
