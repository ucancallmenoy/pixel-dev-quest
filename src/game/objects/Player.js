import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'soldier-idle');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setScale(1.10);
    this.setSize(56, 56);
    this.setOffset(22, 44);
    this.body.setDrag(600, 600);
    this.body.setMaxVelocity(220, 220);

    this.speed = 170;
    this.invulnerableUntil = 0;
    this.health = 3;
    this.isDead = false;
    this.facing = new Phaser.Math.Vector2(1, 0);
    this.isAttacking = false;
    this.attackIndex = 0;
    this.nextAttackTime = 0;
    this.nextShootTime = 0;

    this.setDepth(3);

    this.on('animationcomplete', (anim) => {
      if (anim.key.startsWith('soldier-attack') || anim.key === 'soldier-hurt') {
        this.isAttacking = false;
      }
      if (anim.key === 'soldier-death') {
        this.isDead = true;
      }
    });
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    this.setDepth(this.y);
  }

  update(input, time) {
    if (this.isDead) {
      this.setVelocity(0, 0);
      return;
    }

    const dirX = (input.left ? -1 : 0) + (input.right ? 1 : 0);
    const dirY = (input.up ? -1 : 0) + (input.down ? 1 : 0);
    const moving = dirX !== 0 || dirY !== 0;

    if (moving) {
      const velocity = new Phaser.Math.Vector2(dirX, dirY).normalize().scale(this.speed);
      this.setVelocity(velocity.x, velocity.y);
      this.facing.copy(velocity).normalize();
      if (Math.abs(this.facing.x) > 0.1) {
        this.setFlipX(this.facing.x < 0);
      }
    } else {
      this.setVelocity(0, 0);
    }

    if (!this.isAttacking) {
      if (moving) {
        this.play('soldier-walk', true);
      } else {
        this.play('soldier-idle', true);
      }
    }

    if (input.attack && time > this.nextAttackTime) {
      this.isAttacking = true;
      this.attackIndex = (this.attackIndex % 3) + 1;
      const attackKey = `soldier-attack${this.attackIndex}`;
      this.play(attackKey, true);
      this.nextAttackTime = time + 450;
      this.emit('attack', { index: this.attackIndex, direction: this.facing.clone() });
    }

    if (input.shoot && time > this.nextShootTime) {
      this.nextShootTime = time + 650;
      this.emit('shoot', this.facing.clone());
    }
  }

  hurt(time) {
    if (time < this.invulnerableUntil || this.isDead) {
      return false;
    }
    this.invulnerableUntil = time + 600;
    this.health -= 1;
    this.play('soldier-hurt', true);

    if (this.health <= 0) {
      this.die();
    }
    return true;
  }

  die() {
    if (this.isDead) {
      return;
    }
    this.isDead = true;
    this.setVelocity(0, 0);
    if (this.body) {
      this.body.enable = false;
    }
    this.play('soldier-death', true);
    this.emit('dead');
  }

  respawn(x, y) {
    this.isDead = false;
    this.health = 3;
    this.invulnerableUntil = 0;
    this.setPosition(x, y);
    if (this.body) {
      this.body.enable = true;
    }
    this.play('soldier-idle', true);
  }
}
