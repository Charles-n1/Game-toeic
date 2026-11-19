# Prep my TOEIC — rules for the code

**Be simple as fuck. And the clearest humanely readable function. One function for one functionality.**

That rule comes before all the others.

## How the code is written

- One function = one thing, with a clear name. A long function is cut into small named ones.
- A plain comment above each function that is not obvious: what it does and why, in simple English
  (`// ...`, short sentences, no "robust", "seamless", "leverage"...). No comment when the name says it all.
- Small files, one subject per file:
  - `src/game/data/` the lists (monsters, items, people, sentences...),
  - `src/game/logic/` the rules of the game,
  - `src/game/draw/` the drawing,
  - `src/game/ui/` the screens,
  - `src/game/world/` the map, the ways (paths.js) and the small helpers of places (geometry.js).
- Plain objects and small named functions. No classes, no clever abstractions.
- The numbers that can be tuned are named constants at the top of the file, with a comment.
- Do not write a helper again: `distance`, `facingOf`, `faceTo` are in `src/game/world/geometry.js`.
- Walkers never move "by feel": they follow a way found by `findPath` / `stepSmart` (`src/game/world/paths.js`).
  When there is no way, they stop and choose another goal.
- The demons only appear on the demon land (`src/game/logic/war/demonLand.js`).
- Nothing pops in front of the eyes: what appears by itself in the world (travelers, animals, finds) appears out of
  sight of the hero (`spotOutOfSight` in `src/game/logic/life/spots.js`) and walks in; people come out of a house
  and go into a house.
- A text over the world is written with `writeText` (`src/game/draw/textPictures.js`): drawn once, then copied.
- The same name for the same thing:
  - `NPCS` / people: the people of the story (`data/npcs.js`), their place on the map in `game.run.people`;
  - villagers: the people of the villages (`logic/villagers.js`);
  - patrons: the people inside a building (`game.run.visitHouse.patrons`).

## Before saying it works

```bash
npm test        # the rules of the game: questions, saves, 10 days of play, people, demons, bosses, shops, score
npm run build   # the site builds
```

After each change, both pass. A bug found by hand gets a test in `tests/`.

## Speed

The world is updated every frame (about 0.25 ms of rules, 1.3 ms of drawing today). Things far from the hero live
"in numbers" or wait: the monsters farther than 40 tiles do not move, the far patrols go straight without looking
for a way, a state is completed once (never rebuilt at every call). Measure (the browser profiler, or
`node --cpu-prof`) before optimizing.

## The design notes

`GAME_OBJECTIVE.txt` (the game), `REALISM.txt`, `SOUL.txt`, `life.txt` (ideas to make the world alive),
`patch.txt` (what to fix before adding more).
