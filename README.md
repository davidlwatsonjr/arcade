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

- **Blackjack** — player versus dealer, hit or stand, soft aces, standard 3:2 natural blackjack payout, persistent chips and statistics. First release excludes doubling, splitting and insurance.
- **Go Fish** — head-to-head against a computer, requests by rank, four-of-a-kind books and automatic draws.
- **Yahtzee** — five dice, hold and reroll, thirteen scoring categories, and upper-section bonus.

- **Tonk** — two-player five-card draw/discard game; rank sets, suited runs, laying off, knock at 5 or fewer deadwood points, undercuts, and double natural Tonk/going-out bonuses. House rules vary; this is the initial Arcade variant.
- **Backgammon** — human vs. computer, standard starting setup and movement, hitting, bar re-entry, doubles, mandatory maximum dice usage, bearing off, and match wins. No doubling cube or gammon scoring in the initial version.
- **Chinese Checkers** — two-player full 121-hole star board, adjacent moves and chained jumps over either color, race to fill the opposite triangle. AI uses a greedy distance heuristic.

- **Uno** — four-player color-and-number shedding game against three computer opponents with skips, direction reversals, draw twos and wilds; no challenge or call-out penalties yet.
- **Reversi** — 8×8 flipping game with positional computer opponent.
- **Mancala** — Kalah sowing, captures, and extra turns.
- **Battleship** — concealed five-ship fleets, targeting, and computer hunting.
- **Farkle** — push-your-luck six-dice scoring and banking against the computer.
- **Gin Rummy** — two-player sets/runs, deadwood evaluation, Gin, knocks and undercuts. Opponent layoff is not yet implemented.
- **Euchre** — four-player partnerships, two-round trump bidding, right/left bowers and 10-point matches.
- **Cribbage** — two-player discard-to-crib, pegging, hand and crib scoring, first to 121.

- **Sudoku** — five difficulty tiers; unique-solution generation, notes, undo/redo, basic logical hints with explicitly labeled solution reveals, daily UTC puzzles, timer and local statistics. Difficulty uses clue count and singles/search heuristics, not a full advanced-technique classifier.

- **Sum Logic** — number-selection puzzles with five board sizes, unique-solution validation, extra region targets on Mensa and Ridiculous, tap/drag marking, undo/redo, hints, optional three-life mode, daily UTC puzzles and local saves. Difficulty is initially size-based.

- **Wordle** — five-letter guessing, six attempts, duplicate-aware letter feedback, bundled limited dictionary, random and daily games.
- **Spider Solitaire** — one, two and four suits, legal stack movement, stock dealing, eight completed runs, drag/tap and undo.
- **FreeCell Solitaire** — four free cells, eight columns, four foundations, capacity-limited supermoves, drag/tap and undo.

The Settings panel offers an optional color-vision-friendly palette; symbols, suit labels and other redundant cues remain available in the standard palette. This is an initial accessibility pass, not a formal WCAG audit.

## Architecture

Each new game is self-contained under `src/games/<game>/`, with its own `engine.ts` (pure rules and AI), React view, and rule tests. The lobby in `src/main.tsx` is the only cross-game integration point. Persistent state uses the shared `src/hooks/usePersistentState.ts` hook but separate localStorage keys for every game. No backend is required.

Commits are grouped per game (`feat(connect-four)`, `feat(checkers)`, `feat(dominoes)`, `feat(solitaire)`, `feat(hearts)`, `feat(chess)`), followed by separate lobby integration commits. Additional fixes are committed independently.

## Local development

```sh
npm install
npm run dev
npm test
npm run build
npm run verify:offline
```

## Hosting

Deployed on GitHub Pages at https://arcade.davidlwatsonjr.com/ from pushes to `main` using GitHub Actions. In Settings → Pages, set the source to GitHub Actions and the custom domain to `arcade.davidlwatsonjr.com`. The DNS CNAME should target `davidlwatsonjr.github.io`.

## PWA and offline operation

Production builds run `scripts/build-pwa.mjs`, creating 192/512 PNG icons, an Apple touch icon, and a versioned service worker that **precaches the entire built site** (HTML, JavaScript, CSS, app icons, manifest, and local assets). All gameplay, computer opponents, and saved matches run locally; Google Fonts and other external runtime resources have been removed. The app needs one successful online load to install and cache the version; wait for the **Offline ready** indicator before disconnecting. CI also runs `npm run verify:offline` to verify generated icons and every built resource is listed in the cache. Then switch to airplane mode and reload the installed app to test it.

After each deployment, open the app online once and wait for its new service worker to activate before relying on the updated offline version. Browser data clearing, private browsing, device storage pressure, or service-worker restrictions can remove the cache and saved localStorage. Offline support is device-specific and does not sync scores between devices. The service worker is generated at `dist/sw.js`; the source in `public/sw.js` is overwritten during the production build.

## Deep links and search indexing

Every game has a real static route at `/games/<slug>/` with an individual title, canonical URL, description, crawlable rules and related links. `src/game-catalog.json` is the shared catalog. The build generates the HTML pages, sitemap.xml and robots.txt before the offline precache. Direct URLs and reloads work on GitHub Pages and offline after installation. Submit https://arcade.davidlwatsonjr.com/sitemap.xml to Google Search Console and Bing Webmaster Tools.

Card games support pointer-based drag and drop as well as tap/click and keyboard controls. Drag legal cards to the target areas shown in each game; the rules engine still validates each move.

