const loop = -1;

export const ANIMATION_DEFS = [
  { key: 'soldier-idle', sheet: 'soldier-idle', frameRate: 6, repeat: loop },
  { key: 'soldier-walk', sheet: 'soldier-walk', frameRate: 10, repeat: loop },
  { key: 'soldier-attack1', sheet: 'soldier-attack1', frameRate: 12, repeat: 0 },
  { key: 'soldier-attack2', sheet: 'soldier-attack2', frameRate: 12, repeat: 0 },
  { key: 'soldier-attack3', sheet: 'soldier-attack3', frameRate: 12, repeat: 0 },
  { key: 'soldier-hurt', sheet: 'soldier-hurt', frameRate: 10, repeat: 0 },
  { key: 'soldier-death', sheet: 'soldier-death', frameRate: 8, repeat: 0 },
  { key: 'orc-idle', sheet: 'orc-idle', frameRate: 6, repeat: loop },
  { key: 'orc-walk', sheet: 'orc-walk', frameRate: 9, repeat: loop },
  { key: 'orc-attack1', sheet: 'orc-attack1', frameRate: 11, repeat: 0 },
  { key: 'orc-attack2', sheet: 'orc-attack2', frameRate: 11, repeat: 0 },
  { key: 'orc-hurt', sheet: 'orc-hurt', frameRate: 10, repeat: 0 },
  { key: 'orc-death', sheet: 'orc-death', frameRate: 8, repeat: 0 },
  { key: 'soldier-shadow-idle', sheet: 'soldier-shadow', frameRate: 6, repeat: loop },
  { key: 'soldier-shadow-attack2', sheet: 'soldier-shadow-attack2', frameRate: 10, repeat: 0 },
  { key: 'soldier-shadow-death', sheet: 'soldier-shadow-death', frameRate: 8, repeat: 0 },
  { key: 'orc-shadow-idle', sheet: 'orc-shadow', frameRate: 6, repeat: loop },
  { key: 'orc-shadow-attack2', sheet: 'orc-shadow-attack2', frameRate: 10, repeat: 0 },
  { key: 'orc-shadow-death', sheet: 'orc-shadow-death', frameRate: 8, repeat: 0 },
  { key: 'soldier-ws-idle', sheet: 'soldier-ws-idle', frameRate: 6, repeat: loop },
  { key: 'soldier-ws-walk', sheet: 'soldier-ws-walk', frameRate: 10, repeat: loop },
  { key: 'soldier-ws-attack1', sheet: 'soldier-ws-attack1', frameRate: 12, repeat: 0 },
  { key: 'soldier-ws-attack2', sheet: 'soldier-ws-attack2', frameRate: 12, repeat: 0 },
  { key: 'soldier-ws-attack3', sheet: 'soldier-ws-attack3', frameRate: 12, repeat: 0 },
  { key: 'soldier-ws-hurt', sheet: 'soldier-ws-hurt', frameRate: 10, repeat: 0 },
  { key: 'soldier-ws-death', sheet: 'soldier-ws-death', frameRate: 8, repeat: 0 },
  { key: 'orc-ws-idle', sheet: 'orc-ws-idle', frameRate: 6, repeat: loop },
  { key: 'orc-ws-walk', sheet: 'orc-ws-walk', frameRate: 9, repeat: loop },
  { key: 'orc-ws-attack1', sheet: 'orc-ws-attack1', frameRate: 11, repeat: 0 },
  { key: 'orc-ws-attack2', sheet: 'orc-ws-attack2', frameRate: 11, repeat: 0 },
  { key: 'orc-ws-hurt', sheet: 'orc-ws-hurt', frameRate: 10, repeat: 0 },
  { key: 'orc-ws-death', sheet: 'orc-ws-death', frameRate: 8, repeat: 0 },
  { key: 'soldier-effect-attack1', sheet: 'soldier-effect-attack1', frameRate: 14, repeat: 0 },
  { key: 'soldier-effect-attack2', sheet: 'soldier-effect-attack2', frameRate: 14, repeat: 0 },
  { key: 'soldier-effect-attack3', sheet: 'soldier-effect-attack3', frameRate: 14, repeat: 0 },
  { key: 'orc-effect-attack1', sheet: 'orc-effect-attack1', frameRate: 14, repeat: 0 },
  { key: 'orc-effect-attack2', sheet: 'orc-effect-attack2', frameRate: 14, repeat: 0 },
];

const NPC_KEYS = ['npc-alex', 'npc-anna', 'npc-ardley', 'npc-colt', 'npc-ester', 'npc-tom'];
const NPC_DIRECTIONS = [
  { key: 'down', start: 0 },
  { key: 'left', start: 4 },
  { key: 'right', start: 8 },
  { key: 'up', start: 12 },
];

const createNpcAnimations = (scene) => {
  NPC_KEYS.forEach((npcKey) => {
    NPC_DIRECTIONS.forEach((dir) => {
      const walkKey = `${npcKey}-walk-${dir.key}`;
      if (!scene.anims.exists(walkKey)) {
        scene.anims.create({
          key: walkKey,
          frames: scene.anims.generateFrameNumbers(npcKey, {
            start: dir.start,
            end: dir.start + 3,
          }),
          frameRate: 8,
          repeat: loop,
        });
      }

      const idleKey = `${npcKey}-idle-${dir.key}`;
      if (!scene.anims.exists(idleKey)) {
        scene.anims.create({
          key: idleKey,
          frames: [{ key: npcKey, frame: dir.start }],
          frameRate: 1,
          repeat: loop,
        });
      }
    });
  });
};

const createSlimeAnimations = (scene) => {
  if (scene.anims.exists('slime-idle')) {
    return;
  }
  scene.anims.create({
    key: 'slime-idle',
    frames: scene.anims.generateFrameNumbers('slime', { start: 0, end: 1 }),
    frameRate: 6,
    repeat: loop,
  });
};

export const createAnimations = (scene) => {
  ANIMATION_DEFS.forEach((def) => {
    if (scene.anims.exists(def.key)) {
      return;
    }
    const texture = scene.textures.get(def.sheet);
    if (!texture) {
      return;
    }
    const end = texture.frameTotal - 1;
    scene.anims.create({
      key: def.key,
      frames: scene.anims.generateFrameNumbers(def.sheet, { start: 0, end }),
      frameRate: def.frameRate,
      repeat: def.repeat,
    });
  });

  if (scene.textures.exists('npc-alex')) {
    createNpcAnimations(scene);
  }

  if (scene.textures.exists('slime')) {
    createSlimeAnimations(scene);
  }
};
