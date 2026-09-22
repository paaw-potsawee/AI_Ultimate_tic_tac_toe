# AI Ultimate Tic-Tac-Toe

An Ultimate Tic-Tac-Toe web application for experimenting with and comparing Blind Search and Heuristic Search strategies, developed as part of an Artificial Intelligence course.

## Key Features

- Local two-player pass-and-play mode
- Play against AI with side selection (X or O)
- Comparison between Blind DFS, Blind BFS, and Heuristic AI
- Spectate AI vs AI matches
- Move undo, board reset, move history tracking, and winning line visualization
- Background AI computations via Web Worker to ensure a responsive UI

## Game Rules

Ultimate Tic-Tac-Toe consists of nine 3×3 local boards arranged in a 3×3 grid. Winning a local board claims that position on the macro board.

The cell index chosen within a local board determines which local board the opponent must play on in the subsequent turn. If the targeted local board has already been won or is full, the opponent is granted a free move to play in any open local board. A player wins the game by aligning three claimed local boards in a row, column, or diagonal on the macro board. The game ends in a draw if all local boards are closed without a macro winner.

## Game Modes

| Mode in Game    | Description                                                |
| --------------- | ---------------------------------------------------------- |
| Player          | Two players alternating turns locally                      |
| The Heuristic   | Play against a Minimax AI with heuristic evaluation        |
| The Blind (DFS) | Play against an AI using Depth-First Search with depth 5   |
| The Blind (BFS) | Play against an AI using Breadth-First Search with depth 5 |
| AI vs AI        | Pick any AI engine for X and O and watch them compete      |

## Heuristic AI

The Heuristic AI uses iterative-deepening Minimax with alpha-beta pruning, featuring a maximum search depth of 10 and a soft time budget of 900 ms per move.

Board state evaluation considers:

- Claimed local boards and their strategic positions on the macro board.
- One-in-a-line and two-in-a-line configurations on both local and macro levels.
- Positional weightings for center, corner, and edge cells.
- Advantage of granting or denying the opponent free board choice.
- Terminal game states (win, loss, draw) and distance to terminal depth.

The search engine employs move ordering and a transposition table to prune branches, refreshing the transposition cache across iterative deepening depths.

## Tech Stack

- React 19 and TypeScript 6
- Vite 8
- Tailwind CSS 4
- Web Worker
- Vitest, jsdom, and React Testing Library
- Bitboard representation with `Uint16Array` for high-performance board state evaluation

## Getting Started

### Prerequisites

- Node.js 22.12+ (or Bun)
- npm or Bun

### Installation & Running

Using Bun:

```shell
bun install
bun run dev
```

Or using npm:

```shell
npm install
npm run dev
```

Open the URL shown in your terminal (typically `http://localhost:5173`).

### Running with Docker

The multi-stage Docker build uses Bun for building the static assets and Nginx for serving production files:

```shell
docker compose up --build
```

Then navigate to `http://localhost:3000`.

## Available Scripts

| Command           | Description                                                  |
| ----------------- | ------------------------------------------------------------ |
| `npm run dev`     | Starts the development server                                |
| `npm test`        | Type-checks tests and runs regression test suite with Vitest |
| `npm run build`   | Type-checks production source and builds for production      |
| `npm run lint`    | Lints code with Oxlint                                       |
| `npm run format`  | Formats files using Prettier and Tailwind plugin             |
| `npm run preview` | Previews the production build locally                        |

_(You can also use `bun run <script>` or `bun test`)_

## Project Structure

The codebase is organized using a feature-driven modular architecture:

```text
src/
├── components/                 # Shared UI and setup components
│   ├── header/                 # Application header (Header.tsx)
│   ├── setup/                  # Setup screens (SelectMode.tsx, SelectSide.tsx)
│   └── ui/                     # Reusable primitive UI components (Button.tsx)
├── features/
│   ├── ai/                     # AI feature module
│   │   ├── engine/             # Pure, worker-safe search algorithms (zero React dependencies)
│   │   │   ├── ai.ts           # Strategy dispatcher (DFS, BFS, Heuristic)
│   │   │   ├── bfs.ts          # Breadth-First Search implementation
│   │   │   ├── dfs.ts          # Depth-First Search implementation
│   │   │   ├── heuristicSearch.ts # Minimax with Alpha-Beta pruning & Transposition Table
│   │   │   └── queue.ts        # Queue data structure for BFS traversal
│   │   ├── hooks/              # React lifecycle integration
│   │   │   └── useAiWorker.ts  # Worker lifecycle hook, bridges Web Worker to board store
│   │   ├── types/              # AI and worker message types
│   │   │   └── aiWorker.ts     # WorkerRequest and WorkerResponse types
│   │   ├── worker/             # Dedicated Web Worker thread
│   │   │   └── aiWorker.ts     # Worker entrypoint (imports directly from engine/ and types/)
│   │   └── index.ts            # Public API (exports useAiWorker and worker message types)
│   └── board/                  # Ultimate Tic-Tac-Toe board domain feature
│       ├── components/         # Board visual components (UltimateBoard, LocalBoard, Cell, etc.)
│       ├── store/              # State management and external store integration
│       │   └── boardStore.ts   # Board state, move handling, undo/reset, & AI notifications
│       ├── types/              # Board domain types (board.ts, game.ts, winLine.ts)
│       ├── game.ts             # Core game engine (rules, move validation, win detection)
│       ├── gameRules.ts        # Constants, bitmasks, and win line definitions
│       └── index.ts            # Public API for board components and game types
├── lib/
│   └── cn.ts                   # Tailwind CSS class merge utility (clsx + tailwind-merge)
├── types/
│   └── gameMode.ts             # Shared application-wide game mode definitions
├── App.tsx                     # Top-level screen coordinator & mounts useAiWorker
├── main.tsx                    # Application entrypoint
└── index.css                   # Global styles & Tailwind CSS theme configuration

tests/
├── lib/                        # Game rules and heuristic regression tests
├── store/                      # BoardStore and AI worker lifecycle tests
└── workers/                    # Worker response protocol tests
```

### Architectural Highlights

- **Feature Modularization**: Core domain logic is encapsulated under `features/board` and `features/ai`, each exposing a curated public API via `index.ts`.
- **Worker Isolation**: `aiWorker.ts` runs inside a dedicated Web Worker thread. It imports directly from `../engine` and `../types` via relative paths, avoiding barrel imports and React dependencies.
- **Hook-Store Decoupling**: `useAiWorker` manages the Worker lifecycle in the React component tree and registers triggers with `boardStore`, keeping the store free of direct Worker instantiation.
