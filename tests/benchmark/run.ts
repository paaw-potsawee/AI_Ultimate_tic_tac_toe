import { mkdirSync, writeFileSync } from "node:fs";
import {
    applyMove,
    checkGameWinner,
    getUltimateBoard,
} from "../../src/features/board/game";
import { BOARD_CELL_COUNT } from "../../src/features/board/gameRules";
import type { GameState } from "../../src/features/board/types/game";
import { evaluateBFS } from "../../src/features/ai/engine/bfs";
import { evaluateDFS } from "../../src/features/ai/engine/dfs";
import { evaluateHeuristic } from "../../src/features/ai/engine/heuristicSearch";
import type { SearchResult } from "../../src/features/ai/engine/shared/types";

const BFS_DEPTH = 10;
const DFS_DEPTH = 10;
const GAMES_PER_MATCHUP = 2;
const RESULTS_DIR = "tests/benchmark/results";
const RESULTS_FILE = `${RESULTS_DIR}/latest.json`;

type AlgorithmName = "BFS" | "DFS" | "Heuristic";

const ALGORITHMS: Record<AlgorithmName, (state: GameState) => SearchResult> = {
    BFS: (s) => evaluateBFS(s, BFS_DEPTH),
    DFS: (s) => evaluateDFS(s, DFS_DEPTH),
    Heuristic: (s) => evaluateHeuristic(s),
};

const MATCHUPS: [AlgorithmName, AlgorithmName][] = [
    ["BFS", "BFS"],
    ["BFS", "DFS"],
    ["BFS", "Heuristic"],
    ["DFS", "BFS"],
    ["DFS", "DFS"],
    ["DFS", "Heuristic"],
    ["Heuristic", "BFS"],
    ["Heuristic", "DFS"],
    ["Heuristic", "Heuristic"],
];

interface TurnStat {
    turn: number;
    player: 0 | 1;
    nodes: number;
    durationMs: number;
    // Max live states at once + table entries held (see README glossary).
    peakFrontier: number;
    tableSize: number;
    // heapUsed after minus before the search, in kB (GC-noisy).
    heapDeltaKb: number;
}

interface GameOutcome {
    winner: -1 | 0 | 1;
    totalTurns: number;
    turnStats: TurnStat[];
}

interface PlayerSummary {
    totalNodes: number;
    avgNodesPerTurn: number;
    avgMsPerTurn: number;
    totalTurns: number;
    avgPeakFrontier: number;
    maxPeakFrontier: number;
    avgTableSize: number;
    avgHeapDeltaKb: number;
    maxHeapDeltaKb: number;
}

interface GameWinner {
    game: number;
    winner: string;
    totalTurns: number;
}

interface MatchupResult {
    matchup: string;
    xAlgo: AlgorithmName;
    oAlgo: AlgorithmName;
    gamesPlayed: number;
    wins: {
        x: number;
        o: number;
        draw: number;
    };
    games: GameWinner[];
    turnStats: TurnStat[];
    summary: Record<string, PlayerSummary>;
}

const runGame = (
    xAlgo: (state: GameState) => SearchResult,
    oAlgo: (state: GameState) => SearchResult,
): GameOutcome => {
    let state = getUltimateBoard();
    const turnStats: TurnStat[] = [];
    let winner = checkGameWinner(state);

    while (winner === null) {
        const algo = state.player === 0 ? xAlgo : oAlgo;
        // GC settle needs `bun --expose-gc`; otherwise a no-op.
        (globalThis as { gc?: () => void }).gc?.();
        const heapBefore = process.memoryUsage().heapUsed;
        const start = performance.now();
        const { move, nodes, peakFrontier, tableSize } = algo(state);
        const durationMs = performance.now() - start;
        const heapAfter = process.memoryUsage().heapUsed;

        if (move === null) break;

        turnStats.push({
            turn: turnStats.length + 1,
            player: state.player,
            nodes,
            durationMs,
            peakFrontier,
            tableSize,
            heapDeltaKb: Number(
                ((heapAfter - heapBefore) / 1024).toFixed(2),
            ),
        });

        const boardIdx = Math.floor(move / BOARD_CELL_COUNT);
        const cellIdx = move % BOARD_CELL_COUNT;
        state = applyMove(state, boardIdx, cellIdx);
        winner = checkGameWinner(state);
    }

    return {
        winner: winner ?? -1,
        totalTurns: turnStats.length,
        turnStats,
    };
};

const summarizeTurns = (turns: TurnStat[]): PlayerSummary => {
    const totalNodes = turns.reduce((sum, t) => sum + t.nodes, 0);
    const totalMs = turns.reduce((sum, t) => sum + t.durationMs, 0);
    const totalPeak = turns.reduce((sum, t) => sum + t.peakFrontier, 0);
    const totalTable = turns.reduce((sum, t) => sum + t.tableSize, 0);
    const totalHeap = turns.reduce((sum, t) => sum + t.heapDeltaKb, 0);
    return {
        totalNodes,
        avgNodesPerTurn:
            turns.length > 0 ? Math.round(totalNodes / turns.length) : 0,
        avgMsPerTurn:
            turns.length > 0 ? Number((totalMs / turns.length).toFixed(2)) : 0,
        totalTurns: turns.length,
        avgPeakFrontier:
            turns.length > 0 ? Math.round(totalPeak / turns.length) : 0,
        maxPeakFrontier:
            turns.length > 0
                ? Math.max(...turns.map((t) => t.peakFrontier))
                : 0,
        avgTableSize:
            turns.length > 0 ? Math.round(totalTable / turns.length) : 0,
        avgHeapDeltaKb:
            turns.length > 0
                ? Number((totalHeap / turns.length).toFixed(2))
                : 0,
        maxHeapDeltaKb:
            turns.length > 0
                ? Math.max(...turns.map((t) => t.heapDeltaKb))
                : 0,
    };
};

const runMatchup = (
    xName: AlgorithmName,
    oName: AlgorithmName,
    gamesCount: number,
): MatchupResult => {
    const allTurnStats: TurnStat[] = [];
    const wins = { x: 0, o: 0, draw: 0 };
    const games: GameWinner[] = [];

    for (let gameIndex = 0; gameIndex < gamesCount; gameIndex += 1) {
        const outcome = runGame(ALGORITHMS[xName], ALGORITHMS[oName]);
        allTurnStats.push(...outcome.turnStats);

        let winnerLabel: string;
        if (outcome.winner === 0) {
            wins.x += 1;
            winnerLabel = `X (${xName})`;
        } else if (outcome.winner === 1) {
            wins.o += 1;
            winnerLabel = `O (${oName})`;
        } else {
            wins.draw += 1;
            winnerLabel = "Draw";
        }
        games.push({
            game: gameIndex + 1,
            winner: winnerLabel,
            totalTurns: outcome.totalTurns,
        });
    }

    const summary: Record<string, PlayerSummary> = {};
    summary[`${xName} (as X)`] = summarizeTurns(
        allTurnStats.filter((t) => t.player === 0),
    );
    summary[`${oName} (as O)`] = summarizeTurns(
        allTurnStats.filter((t) => t.player === 1),
    );

    return {
        matchup: `${xName} (X) vs ${oName} (O)`,
        xAlgo: xName,
        oAlgo: oName,
        gamesPlayed: gamesCount,
        wins,
        games,
        turnStats: allTurnStats,
        summary,
    };
};

const main = async (): Promise<void> => {
    console.log("=== AI Algorithm Benchmark ===");
    console.log(`BFS Depth: ${BFS_DEPTH}, DFS Depth: ${DFS_DEPTH}`);
    console.log(`Games per matchup: ${GAMES_PER_MATCHUP}\n`);

    const results: MatchupResult[] = [];

    for (const [xName, oName] of MATCHUPS) {
        console.log(`--- Running Matchup: ${xName} (X) vs ${oName} (O) ---`);
        const result = runMatchup(xName, oName, GAMES_PER_MATCHUP);
        results.push(result);

        console.table(result.summary);
        for (const game of result.games) {
            console.log(
                game.winner === "Draw"
                    ? `  Game ${game.game}: Draw in ${game.totalTurns} turns`
                    : `  Game ${game.game}: ${game.winner} wins in ${game.totalTurns} turns`,
            );
        }
        console.log(
            `Result: X (${xName}) ${result.wins.x} win(s), O (${oName}) ${result.wins.o} win(s), Draws: ${result.wins.draw}\n`,
        );
    }

    mkdirSync(RESULTS_DIR, { recursive: true });
    writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
    console.log(`Benchmark completed. Results written to ${RESULTS_FILE}`);
};

void main();
