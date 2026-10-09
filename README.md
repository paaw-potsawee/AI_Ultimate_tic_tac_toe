# AI Ultimate Tic-Tac-Toe

A modern Ultimate Tic-Tac-Toe web application built to explore and compare **Blind Search** and **Heuristic Search** algorithms in an adversarial game environment.

## Overview

Ultimate Tic-Tac-Toe expands classical Tic-Tac-Toe into a two-tier nested game:

- A macro 3×3 grid composed of nine 3×3 local boards.
- Winning a local board claims that cell on the macro board.
- The cell chosen in a local board routes the opponent to the corresponding local board on the next turn. If the target board is closed or full, the player receives a free choice.
- The overall game is won by capturing three aligned local boards on the macro board.

With branching factors up to 81 and game lengths often exceeding 50 turns, the game presents a complex state space ($>10^{40}$ states) that cannot be solved by brute force.

---

## Game Modes

- **Local Player vs Player**: Two players alternating turns locally.
- **Player vs AI**: Play against any search engine with side selection (X or O).
    - **The Blind (BFS)**: Goal-oriented Breadth-First Search seeking the shallowest winning line.
    - **The Blind (DFS)**: Iterative Deepening Depth-First Search with full Minimax alternation.
    - **The Heuristic**: Iterative Deepening Minimax with Alpha-Beta pruning, move ordering, and board evaluation.
- **AI vs AI**: Spectator mode pitting any two search engines against each other.

---

## Architecture Overview

The application follows a feature-driven architecture separating UI, game state, and computation:

```text
src/
├── components/       # Shared UI primitives, headers, and setup screens
├── features/
│   ├── board/        # Game engine, bitboard state representation, UI boards, and store
│   └── ai/           # Search engines (BFS, DFS, Heuristic), worker hook, and dedicated Web Worker
├── lib/              # Shared helper functions
└── types/            # Application-wide domain types

tests/
├── benchmark/        # Automated AI vs AI matchup runner and metric collector
└── lib/ & store/     # Unit and integration test suites
```

### Key Design Principles

- **Worker-Isolated Computation**: AI searches run on a dedicated background Web Worker thread, keeping UI rendering at 60 FPS without frame drops during deep tree traversal.
- **Feature Modularization**: Domain logic is strictly isolated inside `features/board` and `features/ai`, each exposing clear public interfaces via `index.ts`.
- **Bitboard State Representation**: Core game state and win detection leverage fast bitwise operations for high-throughput node evaluation during search.

---

## Documentation Deep Dives

Detailed technical documentation and empirical data are available in dedicated guides:

- **[AI Search Strategies & Benchmark Analysis](src/features/ai/README.md)**: Formal AIMA problem formulation, algorithmic breakdowns, and head-to-head empirical comparison (optimality, runtime, memory, win rates, node exploration counts).
- **[Engine Architecture & Shared Infrastructure](src/features/ai/engine/README.md)**: Internal mechanics of the transposition table, dual-hash Zobrist keys, deadline enforcement, and move encoding contracts.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Concurrency**: Web Workers (off-main-thread search execution)
- **Testing & Tooling**: Vitest, React Testing Library, Oxlint, Prettier, Bun

---

## Getting Started

### Prerequisites

- Node.js 22.12+ or [Bun](https://bun.sh)

### Installation & Development

```shell
bun install
bun run dev
```

_(Or using npm: `npm install && npm run dev`)_

Open the local development URL shown in your terminal (default `http://localhost:5173`).

### Docker Deployment

```shell
docker compose up --build
```

Access the production application at `http://localhost:3000`.

---

## Available Scripts

| Command             | Description                                                      |
| ------------------- | ---------------------------------------------------------------- |
| `bun run dev`       | Starts local development server with Vite                        |
| `bun run build`     | Type-checks and builds production bundle                         |
| `bun run test`      | Executes full Vitest regression test suite                       |
| `bun run lint`      | Lints codebase with Oxlint                                       |
| `bun run format`    | Formats code using Prettier and Tailwind plugin                  |
| `bun run benchmark` | Runs all 9 AI matchup pairings and generates performance metrics (requires Bun — see below) |
| `bun run preview`   | Serves local production build preview                            |

_(All scripts can also be run with `npm run <command>`, except `benchmark`, whose script invokes the `bun` binary directly.)_

#### Benchmark runner (Bun only)

The benchmark executes TypeScript directly and uses Bun/Node process APIs (`process.memoryUsage()`, `--expose-gc`), so it cannot run with plain `npm`/`node`:

```shell
bun --expose-gc tests/benchmark/run.ts
# (or bun run benchmark — same thing without the GC flag)
```

`npm run benchmark` only works if the `bun` binary is installed and on `PATH`. Without `--expose-gc`, per-turn GC settling is skipped and `heapDeltaKb` figures get noisier (algorithmic peaks are unaffected).

---

## Submission & Links

| Asset              | Link                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Web Application    | [ultimate-ttt.paawaa.dev](https://ultimate-ttt.paawaa.dev/)                                       |
| GitHub Repository  | [paaw-potsawee/AI_Ultimate_tic_tac_toe](https://github.com/paaw-potsawee/AI_Ultimate_tic_tac_toe) |
| Presentation Video | _[Add YouTube presentation link]_                                                                 |
