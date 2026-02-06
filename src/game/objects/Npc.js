import Phaser from 'phaser';


export default class Npc extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);

    scene.add.existing(this);

    this.spriteKey = key;
    this.currentDir = 'down';

    this.setOrigin(0.5, 0.85);
    this.play(`${key}-idle-down`);
    this.setInteractive({ useHandCursor: true });

    this.setDepth(this.y);
  }

  update(player) {
    this.setDepth(this.y);

    if (!player) {
      return;
    }

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.hypot(dx, dy);

    let dir = this.currentDir;
    if (distance < 120) {
      if (Math.abs(dx) > Math.abs(dy)) {
        dir = dx < 0 ? 'left' : 'right';
      } else {
        dir = dy < 0 ? 'up' : 'down';
      }
    } else {
      dir = 'down';
    }

    if (dir !== this.currentDir) {
      this.currentDir = dir;
      const animKey = `${this.spriteKey}-idle-${dir}`;
      if (this.scene.anims.exists(animKey)) {
        this.play(animKey);
      }
    }
  }

  destroy(fromScene) {
    super.destroy(fromScene);
  }
}
