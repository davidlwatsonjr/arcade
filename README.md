# Arcade

Mobile-first single-player arcade built with React, TypeScript, and Vite.

## Games

- **Tic-Tac-Toe** — choose Easy, Medium, or Hard AI. Board, difficulty, and scores are kept in localStorage.
- **Spades** — four-player partnership game: you (South) and your computer partner (North) versus West and East. Bid Nil or 1–13, follow suit, break spades, score contracts and bags, and play to 500 points. In-progress matches automatically resume from localStorage. Blind Nil and jokers are intentionally excluded for now.

- **Connect Four** — seven-column board, tactical computer search, score tracking.
- **Checkers** — mandatory captures, multi-jumps, kings, and computer opponent.
- **Dominoes** — four-player double-six block game, tile-matching and cumulative round scores.
- **Solitaire** — one-card-draw Klondike, stock recycling, seven tableau columns, four foundations.
- **Hearts** — four players, rotating pass direction, penalty points and shooting the moon.
- **Chess** — full move legality via `chess.js` (castling, en passant, checkmate, promotion), with local search AI.

## Architecture

Each new game is self-contained under `src/games/<game>/`, with its own `engine.ts` (pure rules and AI), React view, and rule tests. The lobby in `src/main.tsx` is the only cross-game integration point. Persistent state uses the shared `src/hooks/usePersistentState.ts` hook but separate localStorage keys for every game. No backend is required.

Commits are grouped per game (`feat(connect-four)`, `feat(checkers)`, `feat(dominoes)`, `feat(solitaire)`, `feat(hearts)`, `feat(chess)`), followed by a lobby integration commit. Additional fixes are committed independently.

## Local development

```sh
npm install
npm run dev
npm test
npm run build
```

## Hosting

Deployed on GitHub Pages at https://arcade.davidlwatsonjr.com/ from pushes to `main` using GitHub Actions. In Settings → Pages, set the source to GitHub Actions and the custom domain to `arcade.davidlwatsonjr.com`. The DNS CNAME should target `davidlwatsonjr.github.io`.

## PWA

The app has a web manifest and service worker. After visiting the site, use your browser's Install app or Add to Home Screen option. Offline caching covers the app shell and previously loaded assets. A fresh online visit is needed after updates.
