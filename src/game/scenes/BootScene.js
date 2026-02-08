import Phaser from 'phaser';
import { ASSETS, assetUrl } from '../assets.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  preload() {
    ASSETS.images.forEach((asset) => {
      this.load.image(asset.key, assetUrl(asset.url));
    });

    ASSETS.spritesheets.forEach((asset) => {
      this.load.spritesheet(asset.key, assetUrl(asset.url), {
        frameWidth: asset.frameWidth,
        frameHeight: asset.frameHeight,
      });
    });

    ASSETS.svgs.forEach((asset) => {
      this.load.svg(asset.key, assetUrl(asset.url));
    });

    ASSETS.audio.forEach((asset) => {
      this.load.audio(asset.key, assetUrl(asset.url));
    });

    ASSETS.binaries.forEach((asset) => {
      this.load.binary(asset.key, assetUrl(asset.url));
    });
  }

  create() {
    this.scene.start('game');
  }
}
