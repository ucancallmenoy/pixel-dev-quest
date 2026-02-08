# Pixel Frontier

A cozy top-down pixel village built with Vite + Phaser. Walk around, talk to NPCs, and explore a custom-tile world.

## Features
- Top-down movement
- Clickable NPCs with dialogue
- Custom procedural tileset (grass, paths, water, trees, bushes)
- Decorative houses and a large castle
- Attack/arrow animations for show (no combat)
- Background music with on/off toggle

## Controls
- Move: `W/A/S/D` or `Arrow Keys`
- Attack (animation only): `J`
- Arrow (animation only): `K`
- Restart: `R`

## Asset Credits
All visual assets are from itch.io packs:

```
https://zerie.itch.io/tiny-rpg-character-asset-pack?download
https://raou.itch.io/small-adventure
```

## Folder Structure
```
pixel-rpg/
├─ public/                     # static assets served by Vite
│  ├─ Arrow(Projectile)/       # arrow sprites
│  ├─ Aseprite file/           # Aseprite source files
│  ├─ Characters(100x100)/     # Soldier/Orc sprite sheets and effects
│  ├─ audio/                   # background music (add your own)
│  └─ tilesets/                # NPC sprites and tileset art
├─ src/                        # application source
│  ├─ game/                    # Phaser game code
│  │  ├─ objects/              # game objects (player, NPCs, etc.)
│  │  ├─ scenes/               # Phaser scenes
│  │  ├─ animations.js         # animation definitions
│  │  ├─ assets.js             # asset manifest
│  │  └─ config.js             # Phaser configuration
│  ├─ main.js                  # app shell and Phaser boot
│  ├─ style.css                # UI styles
│  └─ counter.js               # default Vite sample module (unused)
├─ index.html                  # entry HTML
├─ package.json                # scripts and dependencies
└─ README.md                   
```

## Run
```
npm install
npm run dev
```

