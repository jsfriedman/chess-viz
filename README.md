# chess-viz

Board-vision drills for chess beginners: coordinates, piece reach, board scan, flash memory.

**Live:** https://jsfriedman.github.io/chess-viz/

## Develop

```sh
npm install
npm run dev     # http://localhost:5173
npm test
npm run build
```

Requires Node 20.19+ or 22.12+. Spec: [docs/spec.md](docs/spec.md).

### Board scan positions

`src/drills/boardScan/positions.json` is generated, not hand-written:

```sh
npm run positions
```

The script downloads the first slice of the Lichess puzzle and game databases (cached in `.cache/`), plays each game to a random middlegame ply, and profiles every position with the app's own analyzers. It tags blind spots (backward moves, long-range moves, pins, x-rays, en passant), scores difficulty and writes 500 positions per tier. Output is deterministic for a given data slice.

## Credits

- Pieces: [cburnett](https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces) by Colin M.L. Burnett, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/), via [Lichess](https://github.com/lichess-org/lila)
- Positions: [Lichess open database](https://database.lichess.org) (CC0)
- Move generation: [chess.js](https://github.com/jhlywa/chess.js) (BSD-2-Clause)
- Bundled dependency licenses are generated at build time to `dist/third-party-licenses.txt` and linked from the app footer.

## License

Copyright © 2026 jsfriedman. All rights reserved. No license is granted for the source code.

Third-party assets and dependencies remain under their own licenses (see Credits).
