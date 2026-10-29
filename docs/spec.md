# chess-viz — MVP spec

Web app that trains chess beginners (~0–1400) to read the board faster and more accurately.

## Stack
- Vue 3 + Vite + TypeScript, Pinia, Vue Router, `chess.js`, Tailwind CSS v4, npm
- Static SPA, public GitHub repo, GitHub Pages via Actions (also validates puzzle packs on PRs)
- Progress in localStorage behind a `ProgressStore` interface (backend-swappable later)
- Light testing: unit tests for drill logic, answer computation, puzzle validator; one Playwright smoke test
- No license (all rights reserved) for now; third-party credits kept: cburnett pieces (CC BY-SA 3.0) in footer + README, bundled dependency licenses emitted to `third-party-licenses.txt`, Lichess puzzle DB (CC0) credited when seeded

## Sessions
- Difficulty 1–5 per drill
- Untimed (default): 10 items → Results
- Timed: 60s or 3min, as many items as possible; score = correct − errors
- Flow: Home → Drill setup (remembered per drill) → Session → Results

## Drills
1. **Coordinates** — Find (click named square), Name (type/pick highlighted square), Color (light/dark, no board). Orientation: White / Black / Random.
2. **Piece reach** — generated positions; setup picks modes (alternated), pieces (K Q R B N P) + difficulty, remembered.
   - Reach: click every square the highlighted piece can move to (pseudo-legal; pawns push/double-push/capture). L1 alone · L2 own blockers · L3–5 more blockers + capturable enemies (kings never face enemies). After grading, arrows show each line's reach.
   - Path: move the piece (not pawns) to the target in the fewest moves, around own-pawn blockers (0/4/8/12/16 by level). Tapping the target auto-checks; Backspace/tap-last undoes. Wrong → shortest path closest to the attempt shown dashed. Pawn-only selection plays Reach.
3. **Board scan** — setup toggles steps + difficulty; chosen steps run in order on one position: Checks → Captures → Hanging.
   - Positions from the generated pack (see Puzzle packs); ~10% per session have nothing to find for the chosen steps
   - Checks: pieces of side to move that can give check
   - Captures: enemy pieces side to move can capture
   - Hanging (both colors): static exchange evaluation. Captures on the square play out cheapest-first, x-rays included, and either side may stop. A king only recaptures onto an unattacked square. Hanging = the attacker nets material.
   - Board oriented to side to move; turn badge above board; prompts name the color
   - Tap to toggle squares, submit; feedback shows correct / wrong / missed
   - After submit, tap any piece to see why. Arrows show attackers (solid) and defenders (dashed), with a one-line reason: checking moves, legal captures, or the exchange line and its material result.
4. **Flash memory** — position shown N seconds, hidden, then 3–5 generated questions (e.g. "What's on e4?", "Is the c6 knight defended?").

## Puzzle packs
- Generated pack: `src/drills/boardScan/positions.json` from `npm run positions` (build-time, not CI)
  - Sources: slice of Lichess puzzle DB (rating ≤ 2000, ≥ 100 plays; position after the opponent's first move) + slice of rated games (both players 1000–1700, ≥ 3 min base; one random ply 12–40 per game). One position per game, side to move not in check, ≥ 8 pieces, ≤ 6 answers per step, ≤ 5% fully empty.
  - Profiled with the app's analyzers: per-step answer counts, decoys (attacked but safe), blind-spot tags: backward, long-range, knight, pinned, en-passant, x-ray, king-cannot-recapture
  - Difficulty = quintile of a score over piece count, answers, tags, decoys → 500 per tier
  - Tags are kept for adaptive selection once progress tracking exists
- Contributed packs (not built yet): `puzzles/*.yaml`, loaded at build time via `import.meta.glob`
- Positions only (FEN + metadata); answers always computed from FEN
- CONTRIBUTING.md: set up position in lichess.org/editor, copy FEN, add to a pack

```yaml
title: Beginner middlegames
author: githubhandle
difficulty: 1        # 1–5
positions:
  - fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3"
    note: optional
```

## Progress
- Personal best per drill × mode × difficulty
- Last 20 sessions: accuracy, avg time per item

## UX
- Mobile + laptop browsers; board fills width on mobile; large touch targets
- Keyboard: Enter submit, Space next, type coordinates in Name, L/D in Color
- Clean/calm look, light/dark/system theme, subtle motion; feedback always icon + color

## Colors
- Editable (picker + hex): board light/dark, selected, correct, wrong, missed, accent. Pieces are not recolorable.
- Presets: Default, Protanopia, Deuteranopia, Tritanopia, Grayscale, High contrast (anomaly variants share the -opia palette)
- Contrast warnings (non-blocking): square vs square, square vs pieces, feedback colors vs each other
- Pieces are image sets in `public/pieces/<set>/{w,b}{K,Q,R,B,N,P}.svg`; adding a set = folder + registry entry

## Out of scope (MVP)
Blindfold sequences, board reconstruction in Flash, accounts/backend, theme export, in-app puzzle editor, i18n.
