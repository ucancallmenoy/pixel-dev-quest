import Phaser from 'phaser';

export default class Slime extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'slime');

    scene.add.existing(this);

    this.setOrigin(0.5, 0.8);
    this.play('slime-idle');
    this.setDepth(this.y);

    scene.tweens.add({
      targets: this,
      y: y - 2,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  update() {
    this.setDepth(this.y);
  }
}
