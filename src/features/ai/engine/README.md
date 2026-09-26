# Engine Internal Documentation

This document describes how the shared engine infrastructure is used by each AI algorithm. It does not cover the internal implementation of the utilities themselves.

---

## Entry Point — `ai.ts`

`getAiMove` is the single entry point called by the AI worker. It dispatches to one of three algorithms based on the selected game mode and decodes the returned encoded move integer into a structured `Move` object.

| Mode           | Function            | Depth          |
| -------------- | ------------------- | -------------- |
| `BLIND_BFS_AI` | `evaluateBFS`       | max 10         |
| `BLIND_DFS_AI` | `evaluateDFS`       | max 10         |
| `HEURISTIC_AI` | `evaluateHeuristic` | max 10 (IDDFS) |

All three functions return a single encoded integer representing the chosen move, or `null` if no moves are available.

---

## Shared Infrastructure Usage by Algorithm

### `SearchContext`

Every algorithm creates a `SearchContext` at the start of its search:

```ts
const context: SearchContext = {
    deadline: performance.now() + TIME_BUDGET_MS,
    nodes: 0,
    table: new BoundedTranspositionTable(),
};
```

- **`deadline`** — An absolute timestamp. The search checks this periodically and throws `SEARCH_TIMEOUT` when the budget is exceeded.
- **`nodes`** — A counter incremented per visited state, used to pace deadline checks (only checked every N nodes to avoid calling `performance.now()` on every single visit).
- **`table`** — A transposition table shared across the entire search. See below for how each algorithm uses it.

---

### `visitNode` / `enforceDeadline`

- **`visitNode(context)`** — Increments `context.nodes` and checks the deadline every 32 nodes. Throws `SEARCH_TIMEOUT` if the budget is exceeded. Called once per dequeued/visited state.
- **`enforceDeadline(context)`** — Checks the deadline unconditionally. Called at specific high-cost points (e.g. during move sorting in the heuristic engine).

| Algorithm | `visitNode` call location                                          |
| --------- | ------------------------------------------------------------------ |
| BFS       | Once per node dequeued from the queue, after the null guard        |
| DFS       | Top of the recursive `dfs()` function, once per recursive call     |
| Heuristic | Top of the recursive `minimax()` function, once per recursive call |

---

### Transposition Table (via `SearchContext.table`)

The transposition table maps board states to previously computed results, allowing the engine to skip re-evaluating positions already seen through different move orders.

Each entry stores:

- `value` — The evaluated score for that state.
- `depth` — The remaining depth when the value was computed.
- `flag` — `"EXACT"`, `"LOWER"`, or `"UPPER"` (for Alpha-Beta bounds).
- `bestMove` — The best move found from that state (used for move ordering on the next IDS iteration).

**How each algorithm uses it:**

#### BFS

- **Lookup (before expanding a node):** If the table already contains an entry for the current state at a depth equal to or shallower than the current path length, the node is skipped — BFS already found a shorter path to this state.
- **Store (on first visit):** Each state is recorded immediately when first dequeued, before evaluating its children, to prevent duplicate enqueuing of the same state from other branches.

#### DFS (IDS Minimax)

- **Lookup (after terminal/depth checks):** If the table has an entry for the current state at `entry.depth >= currentDepth`, the cached value is returned directly without recursing further.
- **Store (after evaluating all children):** The best score found is stored once the full subtree is evaluated, so subsequent iterations (or transpositions) can reuse it.
- The table is created **once per `evaluateDFS` call** and persists across all IDS depth iterations, so a result cached at depth 3 is still valid when depth 4 runs.

#### Heuristic (Alpha-Beta IDDFS)

- **Lookup (before move generation):** If an entry exists at sufficient depth:
    - `"EXACT"` → return the value immediately (complete result).
    - `"LOWER"` → raise the Alpha floor (this subtree guarantees at least this value).
    - `"UPPER"` → lower the Beta ceiling (this subtree guarantees at most this value).
    - If the raised Alpha ≥ Beta, the subtree is cut off immediately.
- **Move ordering hint:** Even when the cached entry's depth is too shallow to prune the value, `entry.bestMove` is passed to the move sorter so the historically best move is explored first, maximising Alpha-Beta cutoffs.
- **Store (after evaluating all children):** The result is stored with the correct flag (`EXACT`, `LOWER`, or `UPPER`) determined by comparing the result against the original Alpha-Beta window.

---

### Zobrist Hashing (via `getZobristKey`)

Each algorithm calls `getZobristKey(state)` to produce a compact fingerprint of the board state before accessing the transposition table. The key encodes the positions of all X and O pieces on all 9 local boards, the current player's turn, the target board constraint, and the macro-level win state.

| Algorithm | When the key is computed                                     |
| --------- | ------------------------------------------------------------ |
| BFS       | Once per dequeued node, before the table lookup              |
| DFS       | Once per non-terminal interior node, before the table lookup |
| Heuristic | Once per non-terminal interior node, before the table lookup |

---

### Move Encoding

All algorithms return and internally track moves as a single encoded integer:

```
encoded = boardIndex * 9 + cellIndex
```

`boardIndex` is the index of the local board (0–8) and `cellIndex` is the cell within that board (0–8). `getAiMove` in `ai.ts` decodes this into the structured `Move` type consumed by the game engine.
