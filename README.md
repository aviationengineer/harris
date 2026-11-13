# Pixel Quest: The Lost Kingdom

An original 2D side-scrolling arcade platformer. Run, jump, explore, collect gems, stomp enemies, power up, and defeat the boss at the end of each world — across 8 worlds and 32 levels, ending with The Void King in the Dark Fortress.

**Original IP** — protagonist Kai (a young mechanic/explorer in a teal jacket and orange cap with brass goggles), all enemies, bosses, art, music, names and level designs were created for this game. All pixel art is drawn procedurally in code and all music/SFX are synthesised with WebAudio; there are no external assets or dependencies.

## How to play

Open `index.html` in a browser (double-click it, or serve the folder, e.g. via GitHub Pages). Press Enter / tap START to play. Reach the flag at the end of each level; stage 4 of each world is a boss fight — stomp the boss when it is exposed.

## Controls

| Action | Keyboard | Gamepad | Touch |
|---|---|---|---|
| Move | A / D or ← / → | Left stick / D-pad | ◀ ▶ buttons |
| Jump (hold = higher) | Space | A | JUMP |
| Run | Shift | RT | — |
| Attack / fire (needs Flame Core) | E | X | ATK |
| Pause | Esc | Start | — |
| Next level / retry | Enter | — | — |

## Features

- Responsive platforming physics: acceleration, momentum, variable jump height, coyote time and jump buffering
- Smooth camera with dead-zone, lookahead and level clamping; 3-layer parallax per world theme
- 7 enemy types (Walker, Hopper, Flyer, Charger, Shooter, Shield Bot, Crawler) — stomp to defeat, with a 100/200/400/800/1600 chain-combo multiplier
- 6 power-ups: Power Core (+1 HP), Flame Core (projectiles), Shield Core (blocks one hit), Speed Core, Star Core (invincibility), Magnet Core (gem attraction)
- Gems (+100; 100 gems = +1 life), Star Shards, Ancient Keys, Bonus Tokens, mystery blocks, springs, moving/falling/one-way platforms, checkpoints, secret areas (+1000)
- Hazards: spikes, lava, moving saws; level timer with warning states; 3 lives; Game Over / Victory screens
- A boss at the end of every world (World 1: Thornback, Guardian of the Meadows; World 8: The Void King, 3 phases)
- localStorage save: unlocked levels, high score, settings (music/SFX volume, screen-shake toggle, reduced flashing)
- World themes with distinct palettes and music seeds: Green Meadows, Crystal Caverns, Desert Ruins, Sky Islands, Frozen Frontier (slippery ice), Mechanical City, Volcanic Core, Dark Fortress

## Structure

- `index.html` — the entire game in one self-contained file (engine, procedural art/audio, and all 32 levels embedded as data)
- `levels/level_01.json` … `level_32.json` — the same level data, one file per level (spawn, platforms, enemies, collectibles, power-ups, checkpoints, hazards, secrets, goal, boss)
- `tools/generate_levels.js` — level generator: World 1 is hand-designed; Worlds 2–8 are generated with gaps/step-ups capped to the jump physics
- `tests/verify.js` — Node test harness (no dependencies) that boots the game headlessly and plays it: `node tests/verify.js`

## Credits

Pixel Quest: The Lost Kingdom — Original IP. Built as a single-file HTML5 canvas game.
