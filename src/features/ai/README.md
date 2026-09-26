# AI Search Strategies — Ultimate Tic-Tac-Toe

## Formal Problem Definition

Following the AIMA (Artificial Intelligence: A Modern Approach) framework, the search problem is defined as:

| Component            | Definition                                                                                                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **State**            | The full board configuration: bitmasks of X and O cells for all 9 local boards, bitmasks of macro-level won boards for each player, whose turn it is, and which local board the next move is constrained to        |
| **Initial State**    | All bitmasks zero, X moves first (`player = 0`), all 9 local boards open, next board unconstrained                                                                                                                 |
| **Actions**          | Place a mark in any open cell of the currently constrained local board, or any open cell if free-choice. Each action is encoded as `boardIndex × 9 + cellIndex` (0–80)                                             |
| **Transition Model** | Apply the action: update the player's cell bitmask, check if the local board is won, update the macro-level won bitmask, set the next board constraint to the chosen `cellIndex` (or free if that board is closed) |
| **Goal Test**        | A player has three captured local boards aligned in a row, column, or diagonal on the macro grid (win), or all local boards are closed with no macro winner (draw)                                                 |

**Problem difficulty:** The branching factor is up to 81 at the start of the game and shrinks as boards are captured. Game lengths commonly exceed 50 plies. The search space is estimated at $10^{40}$+ states, making exhaustive search impossible.

---

## Blind Search

Blind (uninformed) search explores the game tree without domain knowledge — it treats all moves as equally likely candidates and uses only the structure of the game to decide what to visit next.

### BFS — Breadth-First Search (`bfs.ts`)

BFS explores all states reachable at depth 1 before exploring depth 2, then depth 3, and so on, level by level.

**Goal:** Find the shortest sequence of moves that leads to a win for the current player.

**How it works:**

1. All immediate moves from the current board are enqueued at depth 1. Each node carries the original root move it descended from — this is never overwritten as the search deepens.
2. States are dequeued and evaluated one at a time:
    - If the dequeued state is a **win** for the root player, the root move that led to this branch is returned immediately. Because BFS always processes shallower states first, this is guaranteed to be the shortest possible winning path.
    - If the dequeued state is a **terminal loss**, it is assigned a fixed losing score (`-WIN_SCORE`) and recorded as a fallback candidate.
    - If the dequeued state is a **draw**, it is assigned a score of `0` and recorded as a fallback candidate.
    - If the dequeued state hits the **depth limit** (not terminal), its heuristic score is evaluated and recorded as a fallback candidate.
    - Otherwise, all legal successor states are enqueued at the next depth, preserving the original root move.
3. If no forced win is found before the time budget or depth limit is reached, the root move associated with the best fallback score is returned.

**Transposition caching** is used to skip states already reached via an equal or shorter path, preventing redundant re-expansion of identical board positions reached through different move orders.

**Optimality:** BFS guarantees finding the _shallowest_ winning move sequence, but it does **not** account for the opponent's responses. A win discovered at depth 5 assumes the opponent cooperates with that exact path; the opponent may deviate. This is the fundamental limitation of blind search applied to adversarial games.

**Runtime:** $O(b^d)$ where $b$ is the branching factor and $d$ is the target depth. In practice, the search is bounded by a 1-second time budget.

**Memory:** $O(b^d)$ — all frontier nodes at the current depth must be held in the queue simultaneously. This is the major disadvantage of BFS compared to DFS, especially at deeper search depths.

---

### IDS — Iterative Deepening Search with DFS Minimax (`dfs.ts`)

IDS combines the memory efficiency of depth-first search with the completeness of BFS. It runs DFS to depth 1, then depth 2, then depth 3, incrementally deepening until time expires — always committing only the result from the deepest fully completed iteration.

**How it works:**

1. For each depth limit $d = 1, 2, 3, \ldots$, a full **Minimax** search is run from the root board.
2. Minimax treats the game as an adversarial two-player problem:
    - Player X (Player 0) is the **Maximizer** — always seeking the highest possible score.
    - Player O (Player 1) is the **Minimizer** — always seeking the lowest possible score.
    - On each turn, the current player picks the move that is best for them, assuming the opponent plays optimally.
3. When a terminal state is found (win, loss, or draw), a fixed score is returned: `+WIN_SCORE` for X winning, `-WIN_SCORE` for O winning, and `0` for a draw.
4. When the depth limit is reached without a terminal state, the position is evaluated using the heuristic scoring function, negated to match the Maximizer convention.
5. At the end of each fully completed depth iteration, the best root move found at that depth is committed as the current best answer. If time expires mid-iteration, the previous depth's result is kept.

**Transposition caching** stores the evaluated score for each board state so that identical positions reached by different move orderings are not re-searched within the same depth.

**Optimality:** Minimax is **optimal against a perfectly rational opponent** — if a forced win exists within the search depth, it will be found. IDS makes this anytime: if time is cut short, the best answer from the last completed depth is used.

**Runtime:** $O(b^d)$ per depth. Because each depth re-explores all shallower levels, IDS runs in $O(b^d)$ total — the same asymptotic cost as a single DFS to depth $d$.

**Memory:** $O(d)$ — only the current path from root to leaf is on the call stack at any time. This is the key advantage over BFS.

---

## Heuristic Search

Heuristic search uses domain knowledge to guide the search, dramatically pruning the number of states that need to be evaluated.

### Alpha-Beta Minimax with IDDFS (`heuristicSearch.ts`)

This engine uses the same Iterative Deepening Minimax framework as the blind DFS, but adds two major enhancements that exploit domain knowledge: **Alpha-Beta pruning** and **move ordering**.

**Alpha-Beta Pruning:**
During Minimax, two values $\alpha$ (the Maximizer's guaranteed floor) and $\beta$ (the Minimizer's guaranteed ceiling) are tracked. When $\alpha \geq \beta$, the remaining branches cannot change the outcome for the parent node and are **cut off** without being evaluated. In the best case, this reduces the effective branching factor from $b$ to $\sqrt{b}$, enabling roughly twice the search depth within the same time budget.

**Move Ordering:**
Alpha-Beta pruning is most effective when the best moves are evaluated first. Moves are sorted before being searched using a priority score based on:

- Capturing a local board (highest priority).
- Continuing the most recently identified best move from the previous IDS iteration (from the transposition table), placing it first to maximize pruning.
- Position weights — center and corner cells of each local board are preferred.
- Avoiding sending the opponent to a free-choice turn (penalised).

**Evaluation Function:**
At depth 0 (leaf nodes that are not terminal), the board position is scored using a weighted evaluation:

- **Macro level:** Points for capturing boards in strategic positions, and for having 1 or 2 boards aligned in a global winning line.
- **Local level:** Points for having 1 or 2 cells aligned in local winning lines, weighted by board position.
- **Tempo:** A bonus for having a free-choice turn (not being constrained to a specific local board).

**Optimality:** Optimal within the search depth against a rational opponent, same as blind DFS Minimax. Because Alpha-Beta reaches significantly greater depths within the time budget, it plays stronger in practice.

**Runtime:** $O(b^{d/2})$ in the best case (with perfect move ordering), $O(b^d)$ worst case (with poor ordering). In practice, good move ordering achieves close to best-case performance.

**Memory:** $O(d)$ for the call stack, plus the transposition table bounded at 100,000 entries.

---

## Comparison

### Algorithm Properties

| Property            | BFS (Blind)                                      | IDS DFS Minimax (Blind)                    | Alpha-Beta IDDFS (Heuristic)                        |
| ------------------- | ------------------------------------------------ | ------------------------------------------ | --------------------------------------------------- |
| **Adversarial?**    | No — optimistic (assumes no opponent resistance) | Yes — plays optimal moves for both sides   | Yes — plays optimal moves for both sides            |
| **Optimal?**        | Shortest path to win (if opponent cooperates)    | Optimal within depth vs. rational opponent | Optimal within depth vs. rational opponent          |
| **Effective depth** | Shallow — limited by memory and branching factor | Moderate — memory-efficient but full tree  | Deep — Alpha-Beta halves effective branching factor |
| **Runtime**         | $O(b^d)$                                         | $O(b^d)$                                   | $O(b^{d/2})$ best case                              |
| **Memory**          | $O(b^d)$ — entire frontier in queue              | $O(d)$ — call stack only                   | $O(d)$ — call stack + bounded TT                    |
| **Key weakness**    | Exponential memory; non-adversarial evaluation   | Slower at equal depth vs. Alpha-Beta       | Requires a well-tuned evaluation function           |

### Benchmark Results (depth 10, 2 games per matchup)

> Results measured by running `bun run benchmark`. Each number is averaged over 2 games.

#### Head-to-Head Win Rates

| X Player  | O Player  | X Wins | O Wins | Draws |
| --------- | --------- | ------ | ------ | ----- |
| BFS       | BFS       | 2      | 0      | 0     |
| BFS       | DFS       | 0      | 2      | 0     |
| BFS       | Heuristic | 0      | 2      | 0     |
| DFS       | BFS       | 2      | 0      | 0     |
| DFS       | DFS       | 2      | 0      | 0     |
| DFS       | Heuristic | 0      | 2      | 0     |
| Heuristic | BFS       | 2      | 0      | 0     |
| Heuristic | DFS       | 2      | 0      | 0     |
| Heuristic | Heuristic | 1      | 0      | 1     |

**Overall ranking:** Heuristic > DFS > BFS

#### Average Nodes Explored per Turn

| Algorithm | Avg Nodes/Turn | Avg Time/Turn (ms) |
| --------- | -------------- | ------------------ |
| BFS       | ~280,000       | ~960 ms            |
| DFS       | ~1,020,000     | ~945 ms            |
| Heuristic | ~40,000        | ~85 ms             |

> **Key insight:** The Heuristic engine explores **25× fewer nodes** than DFS and **7× fewer** than BFS per turn, yet wins every head-to-head matchup. Alpha-Beta pruning and move ordering redirect the search budget toward positions that actually matter, rather than exhaustively expanding all reachable states.

#### Memory Usage

- **BFS:** Holds the entire frontier in memory simultaneously. At depth 10 with branching factor ~30, the queue can grow to hundreds of thousands of entries — the dominant memory consumer.
- **DFS / IDS:** Only the current path (depth-limited to 10 frames) is on the call stack at any time. Memory is $O(d)$.
- **Heuristic:** Same $O(d)$ call stack as DFS, plus a bounded transposition table capped at 100,000 entries (~a few MB).
