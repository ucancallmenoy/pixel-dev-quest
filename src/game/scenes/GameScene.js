import Phaser from 'phaser';
import { createAnimations } from '../animations.js';
import Player from '../objects/Player.js';
import Orc from '../objects/Orc.js';
import Npc from '../objects/Npc.js';
import Slime from '../objects/Slime.js';

const TILE_SIZE = 16;
const MAP_WIDTH = 60;
const MAP_HEIGHT = 44;
const CUSTOM_TILESET_KEY = 'cozy-tiles';

const TILE_SET = {
  grass: [0, 1, 2],
  path: [3, 4],
  water: [5, 6],
  tree: [8],
  bush: [9],
  flower: [10, 11],
  rock: [12],
};

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('game');
    this.map = null;
    this.tileset = null;
    this.groundLayer = null;
    this.decorLayer = null;
    this.isGameOver = false;
    this.waterIndexSet = new Set(TILE_SET.water);
    this.pathIndexSet = new Set(TILE_SET.path);
    this.bgm = null;
    this.musicEnabled = true;
  }

  create() {
    createAnimations(this);

    this.createTilemap();
    this.createCozyArea();
    this.createTreeSprites();
    this.createCastle();
    this.setupTileCollisions();

    const spawn = this.toWorld(10, 18);
    this.player = new Player(this, spawn.x, spawn.y);
    this.orc = new Orc(this, spawn.x + 160, spawn.y + 90);
    this.player.on('dead', () => this.handlePlayerDeath());

    this.npcs = this.createNpcs();
    this.slimes = this.createSlimes();

    this.playerArrows = this.physics.add.group();

    this.inputState = this.createInputState();
    this.setupColliders();
    this.setupCombatHooks();
    this.setupCamera();
    this.createGameOverUi();
    this.createDialogueUi();
    this.bindDialogueHandlers();
    this.setupMusic();
  }

  update(time) {
    if (this.restartKey && Phaser.Input.Keyboard.JustDown(this.restartKey)) {
      this.scene.restart();
      return;
    }
    if (this.isGameOver) {
      return;
    }

    const input = this.readInput();

    if (this.player) {
      this.player.update(input, time);
    }

    if (this.orc) {
      this.orc.update(this.player, time);
    }

    this.npcs.forEach((npc) => npc.update(this.player));
    this.slimes.forEach((slime) => slime.update());
  }

  ensureCustomTileset() {
    if (this.textures.exists(CUSTOM_TILESET_KEY)) {
      return;
    }

    const columns = 4;
    const rows = 4;
    const canvas = this.textures.createCanvas(
      CUSTOM_TILESET_KEY,
      columns * TILE_SIZE,
      rows * TILE_SIZE
    );
    const ctx = canvas.getContext();

    const drawTile = (index, drawFn) => {
      const x = (index % columns) * TILE_SIZE;
      const y = Math.floor(index / columns) * TILE_SIZE;
      ctx.clearRect(x, y, TILE_SIZE, TILE_SIZE);
      drawFn(x, y);
    };

    const fillTile = (x, y, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    };

    const speckle = (x, y, colors, count) => {
      for (let i = 0; i < count; i += 1) {
        const px = x + Phaser.Math.Between(0, TILE_SIZE - 1);
        const py = y + Phaser.Math.Between(0, TILE_SIZE - 1);
        ctx.fillStyle = Phaser.Utils.Array.GetRandom(colors);
        ctx.fillRect(px, py, 1, 1);
      }
    };

    drawTile(0, (x, y) => {
      fillTile(x, y, '#6fbe5f');
      speckle(x, y, ['#5aa650', '#7ad66a'], 18);
    });

    drawTile(1, (x, y) => {
      fillTile(x, y, '#66b355');
      speckle(x, y, ['#4f9446', '#82d873'], 22);
    });

    drawTile(2, (x, y) => {
      fillTile(x, y, '#74c765');
      speckle(x, y, ['#5fb255', '#8edc7a'], 14);
    });

    drawTile(3, (x, y) => {
      fillTile(x, y, '#b58a57');
      speckle(x, y, ['#a37446', '#caa074'], 20);
    });

    drawTile(4, (x, y) => {
      fillTile(x, y, '#a97b4f');
      speckle(x, y, ['#915f3a', '#c89a6b'], 18);
    });

    drawTile(5, (x, y) => {
      fillTile(x, y, '#6bbbe8');
      ctx.fillStyle = '#5aa9db';
      ctx.fillRect(x, y + 4, TILE_SIZE, 3);
      speckle(x, y, ['#8ad5ff', '#4d99cc'], 10);
    });

    drawTile(6, (x, y) => {
      fillTile(x, y, '#62b0de');
      ctx.fillStyle = '#4f9acc';
      ctx.fillRect(x, y + 6, TILE_SIZE, 2);
      speckle(x, y, ['#84d0ff', '#559fcd'], 10);
    });

    drawTile(8, (x, y) => {
      ctx.fillStyle = '#2f7d32';
      ctx.fillRect(x + 3, y + 2, 10, 10);
      ctx.fillStyle = '#3b9b3c';
      ctx.fillRect(x + 4, y + 3, 8, 8);
      ctx.fillStyle = '#265b2a';
      ctx.fillRect(x + 2, y + 6, 12, 6);
      ctx.fillStyle = '#6b4b2a';
      ctx.fillRect(x + 7, y + 10, 2, 4);
    });

    drawTile(9, (x, y) => {
      ctx.fillStyle = '#3f8f3f';
      ctx.fillRect(x + 3, y + 6, 10, 6);
      ctx.fillStyle = '#4faa4d';
      ctx.fillRect(x + 4, y + 5, 8, 6);
      ctx.fillStyle = '#2f6f35';
      ctx.fillRect(x + 2, y + 8, 12, 4);
    });

    drawTile(10, (x, y) => {
      ctx.fillStyle = '#4faa4d';
      ctx.fillRect(x + 6, y + 6, 4, 4);
      ctx.fillStyle = '#ffdc6b';
      ctx.fillRect(x + 7, y + 7, 2, 2);
    });

    drawTile(11, (x, y) => {
      ctx.fillStyle = '#4faa4d';
      ctx.fillRect(x + 5, y + 6, 6, 4);
      ctx.fillStyle = '#f08bb4';
      ctx.fillRect(x + 7, y + 7, 2, 2);
    });

    drawTile(12, (x, y) => {
      ctx.fillStyle = '#8b8f94';
      ctx.fillRect(x + 4, y + 6, 8, 6);
      ctx.fillStyle = '#6f7278';
      ctx.fillRect(x + 5, y + 7, 6, 4);
      ctx.fillStyle = '#a0a4aa';
      ctx.fillRect(x + 6, y + 5, 4, 2);
    });

    canvas.refresh();
  }

  createTilemap() {
    this.ensureCustomTileset();

    this.map = this.make.tilemap({
      width: MAP_WIDTH,
      height: MAP_HEIGHT,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });

    this.tileset = this.map.addTilesetImage(
      CUSTOM_TILESET_KEY,
      CUSTOM_TILESET_KEY,
      TILE_SIZE,
      TILE_SIZE
    );

    this.groundLayer = this.map.createBlankLayer('ground', this.tileset).setDepth(0);
    this.decorLayer = this.map.createBlankLayer('decor', this.tileset).setDepth(1);

    this.groundLayer.randomize(0, 0, MAP_WIDTH, MAP_HEIGHT, TILE_SET.grass);

    const worldWidth = MAP_WIDTH * TILE_SIZE;
    const worldHeight = MAP_HEIGHT * TILE_SIZE;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBackgroundColor('#9fd8ff');
  }

  createCozyArea() {
    this.paintRect(this.groundLayer, 6, 18, 20, 2, TILE_SET.path);
    this.paintRect(this.groundLayer, 14, 10, 2, 10, TILE_SET.path);
    this.paintRect(this.groundLayer, 8, 8, 8, 6, TILE_SET.path);

    this.paintRect(this.groundLayer, 26, 10, 8, 5, TILE_SET.water);
    this.paintRect(this.groundLayer, 6, 28, 10, 5, TILE_SET.water);
    this.paintRect(this.groundLayer, 36, 18, 8, 6, TILE_SET.water);

    this.scatterTiles(this.decorLayer, TILE_SET.bush, 80, 4, 6, 28, 20);
    this.scatterTiles(this.decorLayer, TILE_SET.flower, 120, 4, 8, 28, 20);
    this.scatterTiles(this.decorLayer, TILE_SET.rock, 30, 4, 8, 28, 20);
    this.scatterTiles(this.decorLayer, TILE_SET.bush, 70, 32, 8, 20, 20);
  }

  createTreeSprites() {
    if (!this.textures.exists('tree-3x')) {
      const size = TILE_SIZE * 3;
      const canvas = this.textures.createCanvas('tree-3x', size, size);
      const ctx = canvas.getContext();

      ctx.fillStyle = '#2f7d32';
      ctx.fillRect(10, 6, 28, 26);
      ctx.fillStyle = '#3b9b3c';
      ctx.fillRect(14, 10, 20, 18);
      ctx.fillStyle = '#265b2a';
      ctx.fillRect(8, 20, 32, 16);
      ctx.fillStyle = '#6b4b2a';
      ctx.fillRect(22, 30, 4, 12);

      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(12, 34, 24, 4);

      canvas.refresh();
    }

    this.treeSprites = this.add.group();

    const treeTiles = [
      { x: 18, y: 8 },
      { x: 8, y: 12 }, { x: 12, y: 13 }, { x: 16, y: 12 }, { x: 20, y: 10 },
      { x: 28, y: 8 }, { x: 32, y: 10 }, { x: 36, y: 8 }, { x: 40, y: 10 },
      { x: 30, y: 16 }, { x: 34, y: 18 }, { x: 38, y: 16 }, { x: 42, y: 18 },
      { x: 8, y: 26 }, { x: 12, y: 28 }, { x: 16, y: 26 }, { x: 20, y: 28 },
      { x: 26, y: 30 }, { x: 30, y: 32 }, { x: 34, y: 30 }, { x: 38, y: 32 },
    ];

    treeTiles.forEach((tile) => {
      const baseTile = this.groundLayer.getTileAt(tile.x, tile.y);
      if (baseTile && this.waterIndexSet.has(baseTile.index)) {
        return;
      }
      const world = this.toWorld(tile.x, tile.y);
      const tree = this.add.image(world.x, world.y + 6, 'tree-3x');
      tree.setDepth(world.y + 6);
      this.treeSprites.add(tree);
    });
  }

  createCastle() {
    if (!this.textures.exists('castle-big')) {
      const width = TILE_SIZE * 12;
      const height = TILE_SIZE * 10;
      const canvas = this.textures.createCanvas('castle-big', width, height);
      const ctx = canvas.getContext();

      ctx.fillStyle = '#d2d6dd';
      ctx.fillRect(0, 24, width, height - 24);
      ctx.fillStyle = '#b9bdc4';
      ctx.fillRect(8, 32, width - 16, height - 32);

      ctx.fillStyle = '#9aa0aa';
      for (let x = 0; x < width; x += 12) {
        ctx.fillRect(x, 18, 8, 10);
      }

      ctx.fillStyle = '#c6cbd3';
      ctx.fillRect(width / 2 - 18, height - 40, 36, 40);
      ctx.fillStyle = '#8e6a4c';
      ctx.fillRect(width / 2 - 10, height - 26, 20, 26);
      ctx.fillStyle = '#6f4d35';
      ctx.fillRect(width / 2 - 6, height - 22, 12, 22);

      ctx.fillStyle = '#7d8591';
      ctx.fillRect(14, 44, 10, 10);
      ctx.fillRect(width - 24, 44, 10, 10);
      ctx.fillRect(width / 2 - 5, 44, 10, 10);

      ctx.strokeStyle = '#a2a7b0';
      for (let y = 32; y < height - 8; y += 10) {
        ctx.beginPath();
        ctx.moveTo(8, y);
        ctx.lineTo(width - 8, y);
        ctx.stroke();
      }

      canvas.refresh();
    }

    const castleTileX = 10;
    const castleTileY = -2;
    const world = this.toWorld(castleTileX, castleTileY);
    const castle = this.add.image(world.x, world.y + 24, 'castle-big');
    castle.setOrigin(0.5, 0);
    castle.setDepth(world.y + 30);

    this.physics.add.existing(castle, true);
    const castleBody = castle.body;
    if (castleBody) {
      const castleWidth = TILE_SIZE * 12;
      const castleHeight = TILE_SIZE * 8;
      castleBody.setSize(castleWidth, castleHeight);
      castleBody.setOffset(-castleWidth / 2 + 80, 30);
    }

    this.castle = castle;
  }

  setupTileCollisions() {
    this.groundLayer.setCollision(TILE_SET.water);
  }

  paintRect(layer, startX, startY, width, height, indices) {
    for (let y = startY; y < startY + height; y += 1) {
      for (let x = startX; x < startX + width; x += 1) {
        const tileIndex = Array.isArray(indices) ? Phaser.Utils.Array.GetRandom(indices) : indices;
        layer.putTileAt(tileIndex, x, y);
      }
    }
  }

  scatterTiles(layer, indices, count, startX, startY, width, height) {
    for (let i = 0; i < count; i += 1) {
      const x = Phaser.Math.Between(startX, startX + width);
      const y = Phaser.Math.Between(startY, startY + height);
      const baseTile = this.groundLayer.getTileAt(x, y);
      if (baseTile && (this.waterIndexSet.has(baseTile.index) || this.pathIndexSet.has(baseTile.index))) {
        continue;
      }
      const tileIndex = Array.isArray(indices) ? Phaser.Utils.Array.GetRandom(indices) : indices;
      layer.putTileAt(tileIndex, x, y);
    }
  }

  toWorld(tileX, tileY) {
    return {
      x: tileX * TILE_SIZE + TILE_SIZE / 2,
      y: tileY * TILE_SIZE + TILE_SIZE / 2,
    };
  }

  createNpcs() {
    const alex = this.toWorld(14, 18);
    const anna = this.toWorld(22, 18);
    const ardley = this.toWorld(10, 26);
    const colt = this.toWorld(24, 30);
    const ester = this.toWorld(32, 20);
    const tom = this.toWorld(20, 34);

    return [
      new Npc(this, alex.x, alex.y, 'npc-alex'),
      new Npc(this, anna.x, anna.y, 'npc-anna'),
      new Npc(this, ardley.x, ardley.y, 'npc-ardley'),
      new Npc(this, colt.x, colt.y, 'npc-colt'),
      new Npc(this, ester.x, ester.y, 'npc-ester'),
      new Npc(this, tom.x, tom.y, 'npc-tom'),
    ];
  }

  createSlimes() {
    const slimeA = this.toWorld(16, 12);
    const slimeB = this.toWorld(26, 24);
    const slimeC = this.toWorld(36, 28);

    return [
      new Slime(this, slimeA.x, slimeA.y),
      new Slime(this, slimeB.x, slimeB.y),
      new Slime(this, slimeC.x, slimeC.y),
    ];
  }

  setupCamera() {
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(2);
  }

  createGameOverUi() {
    const uiWidth = this.cameras.main.width / this.cameras.main.zoom;
    const uiHeight = this.cameras.main.height / this.cameras.main.zoom;

    this.gameOverPanel = this.add
      .rectangle(uiWidth / 2, uiHeight / 2, 260, 90, 0x0b1324, 0.85)
      .setScrollFactor(0)
      .setDepth(1200)
      .setVisible(false);

    this.gameOverText = this.add
      .text(uiWidth / 2, uiHeight / 2, 'You fell!\nPress R to respawn', {
        fontFamily: 'Silkscreen, monospace',
        fontSize: '14px',
        color: '#fef9d7',
        align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1201)
      .setVisible(false);

    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  }

  createDialogueUi() {
    this.dialogueText = this.add
      .text(0, 0, '', {
        fontFamily: 'Silkscreen, monospace',
        fontSize: '7.5px',
        color: '#fef9d7',
        align: 'center',
        backgroundColor: null,
      })
      .setOrigin(0.5)
      .setDepth(1201)
      .setVisible(false);
  }

  createInputState() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      attack: Phaser.Input.Keyboard.KeyCodes.J,
      shoot: Phaser.Input.Keyboard.KeyCodes.K,
    });

    return {
      left: false,
      right: false,
      up: false,
      down: false,
      attack: false,
      shoot: false,
    };
  }

  bindDialogueHandlers() {
    const dialogueMap = new Map([
      ['npc-alex', 'Hey, looking for Patrick? His GitHub is where the magic happens!'],
      ['npc-anna', 'The code behind this world? Yep, Patrick crafted it all himself!'],
      ['npc-ardley', 'Need a quest? Start with Patrick’s projects—he’s got plenty!'],
      ['npc-colt', 'Check out Patrick’s repo! Even we NPCs are impressed!'],
      ['npc-ester', 'The terrain’s custom CSS, but Patrick made every pixel count!'],
      ['npc-tom', 'Want more adventures? Patrick’s portfolio is full of them!'],
      ['orc', 'Rawr! Even I approve of Patrick’s coding skills!'],
    ]);

    const sayLine = (gameObject, key) => {
      const line = dialogueMap.get(key) || 'Hello there';
      this.showDialogueAbove(gameObject, line);
    };

    if (this.orc) {
      this.orc.on('pointerdown', () => sayLine(this.orc, 'orc'));
    }

    this.npcs.forEach((npc) => {
      npc.on('pointerdown', () => sayLine(npc, npc.texture?.key));
    });
  }

  readInput() {
    const left = this.cursors.left.isDown || this.keys.left.isDown;
    const right = this.cursors.right.isDown || this.keys.right.isDown;
    const up = this.cursors.up.isDown || this.keys.up.isDown;
    const down = this.cursors.down.isDown || this.keys.down.isDown;
    const attack = Phaser.Input.Keyboard.JustDown(this.keys.attack);
    const shoot = Phaser.Input.Keyboard.JustDown(this.keys.shoot);

    this.inputState.left = left;
    this.inputState.right = right;
    this.inputState.up = up;
    this.inputState.down = down;
    this.inputState.attack = attack;
    this.inputState.shoot = shoot;

    return this.inputState;
  }

  setupColliders() {
    this.physics.add.collider(this.player, this.groundLayer);
    this.physics.add.collider(this.orc, this.groundLayer);
    if (this.castle) {
      this.physics.add.collider(this.player, this.castle);
      this.physics.add.collider(this.orc, this.castle);
    }
  }

  setupCombatHooks() {
    this.player.on('attack', ({ index, direction }) => {
      this.spawnEffect('soldier', index, this.player, direction);
    });

    this.player.on('shoot', (direction) => {
      this.spawnArrow(this.player, this.playerArrows, 'arrow-soldier-32', 320, direction);
    });
  }

  handlePlayerDeath() {
    if (this.isGameOver) {
      return;
    }
    this.isGameOver = true;
    this.physics.pause();
    this.time.delayedCall(400, () => {
      if (this.gameOverPanel) {
        this.gameOverPanel.setVisible(true);
      }
      if (this.gameOverText) {
        this.gameOverText.setVisible(true);
      }
    });
  }

  spawnEffect(type, index, source, direction) {
    const effectKey = `${type}-effect-attack${index}`;
    if (!this.textures.exists(effectKey)) {
      return;
    }
    const dir = direction && direction.lengthSq() > 0 ? direction : source.facing;
    const offsetX = dir ? dir.x * 18 : source.flipX ? -18 : 18;
    const offsetY = dir ? dir.y * 18 : 0;
    const effect = this.add.sprite(source.x + offsetX, source.y + offsetY, effectKey).setDepth(900);
    effect.setFlipX(source.flipX);
    effect.play(effectKey);
    effect.on('animationcomplete', () => effect.destroy());
  }

  spawnArrow(source, group, textureKey, speed, direction) {
    if (!this.textures.exists(textureKey)) {
      return;
    }
    const dir = direction && direction.lengthSq() > 0
      ? direction.clone().normalize()
      : source.facing
        ? source.facing.clone().normalize()
        : new Phaser.Math.Vector2(source.flipX ? -1 : 1, 0);

    if (dir.lengthSq() === 0) {
      dir.set(1, 0);
    }

    const arrow = group.create(source.x + dir.x * 18, source.y + dir.y * 10, textureKey);
    if (!arrow) return;

    arrow.setDepth(900);
    arrow.body.allowGravity = false;
    arrow.setVelocity(dir.x * speed, dir.y * speed);
    arrow.setRotation(Math.atan2(dir.y, dir.x));
    arrow.setScale(0.7);
    arrow.setCollideWorldBounds(true);
    arrow.body.onWorldBounds = true;
    arrow.setSize(18, 8);
    arrow.setOffset(7, 12);

    this.time.delayedCall(2000, () => {
      if (arrow.active) {
        arrow.destroy();
      }
    });
  }

  showDialogueAbove(target, text) {
    if (!this.dialogueText || !target) {
      return;
    }
    const bubbleY = target.y - 46;
    this.dialogueText.setPosition(target.x, bubbleY).setText(text).setVisible(true);

    if (this.dialogueTimer) {
      this.dialogueTimer.remove(false);
    }
    this.dialogueTimer = this.time.delayedCall(1800, () => {
      if (this.dialogueText) this.dialogueText.setVisible(false);
    });
  }

  setupMusic() {
    this.musicEnabled = this.readMusicPreference();
    this.bgm = this.sound.add('bgm', {
      loop: true,
      volume: 0.35,
    });

    const tryPlay = () => {
      if (!this.bgm || this.bgm.isPlaying || !this.musicEnabled) {
        return;
      }
      this.bgm.play();
    };

    if (this.musicEnabled) {
      if (this.sound.locked) {
        this.sound.once(Phaser.Sound.Events.UNLOCKED, tryPlay);
      }
      tryPlay();
    }

    this.game.events.on('music:toggle', this.handleMusicToggle, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off('music:toggle', this.handleMusicToggle, this);
      if (this.bgm) {
        this.bgm.stop();
        this.bgm.destroy();
        this.bgm = null;
      }
    });
  }

  readMusicPreference() {
    const stored = window.localStorage?.getItem('musicEnabled');
    return stored !== 'false';
  }

  handleMusicToggle(enabled) {
    this.musicEnabled = enabled;
    if (!this.bgm) {
      return;
    }

    if (enabled) {
      if (this.sound.locked) {
        this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
          if (this.bgm && !this.bgm.isPlaying) {
            this.bgm.play();
          }
        });
      } else if (!this.bgm.isPlaying) {
        this.bgm.play();
      }
    } else if (this.bgm.isPlaying) {
      this.bgm.stop();
    }
  }
}
