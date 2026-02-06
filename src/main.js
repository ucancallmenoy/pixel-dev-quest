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

new Phaser.Game(config);
