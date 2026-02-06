import Phaser from 'phaser';

export default class Orc extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'orc-idle');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setScale(1.10);
    this.setSize(56, 56);
    this.setOffset(22, 44);
    this.body.setDrag(500, 500);
    this.body.setMaxVelocity(200, 200);
    this.setInteractive({ useHandCursor: true });

    this.speed = 90;
    this.isDead = false;
    this.facing = new Phaser.Math.Vector2(-1, 0);
    this.wanderDir = new Phaser.Math.Vector2(-1, 0);
    this.nextWanderTime = 0;

    this.setDepth(3);

    this.on('animationcomplete', (anim) => {
      if (anim.key === 'orc-death') {
        this.isDead = true;
      }
    });
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    this.setDepth(this.y);
  }

  update(target, time) {
    if (this.isDead) {
      this.setVelocity(0, 0);
      return;
    }

    if (time > this.nextWanderTime) {
      const idleChance = Phaser.Math.FloatBetween(0, 1);
      if (idleChance < 0.25) {
        this.wanderDir.set(0, 0);
      } else {
        this.wanderDir = Phaser.Math.RandomXY(this.wanderDir, 1).normalize();
      }
      this.nextWanderTime = time + Phaser.Math.Between(1200, 2400);
    }

    this.setVelocity(this.wanderDir.x * this.speed * 0.6, this.wanderDir.y * this.speed * 0.6);
    this.facing.copy(this.wanderDir);

    if (Math.abs(this.facing.x) > 0.1) {
      this.setFlipX(this.facing.x < 0);
    }

    if (this.wanderDir.lengthSq() > 0) {
      this.play('orc-walk', true);
    } else {
      this.play('orc-idle', true);
    }
  }
}
