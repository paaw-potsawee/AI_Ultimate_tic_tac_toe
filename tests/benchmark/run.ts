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
const GAMES_PER_MATCHUP = 10;
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
}

interface MatchupResult {
    matchup: string;
    gamesPlayed: number;
    wins: {
        x: number;
        o: number;
        draw: number;
    };
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
        const start = performance.now();
        const { move, nodes } = algo(state);
        const durationMs = performance.now() - start;

        if (move === null) break;

        turnStats.push({
            turn: turnStats.length + 1,
            player: state.player,
            nodes,
            durationMs,
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

const runMatchup = (
    xName: AlgorithmName,
    oName: AlgorithmName,
    gamesCount: number,
): MatchupResult => {
    const allTurnStats: TurnStat[] = [];
    const wins = { x: 0, o: 0, draw: 0 };

    for (let gameIndex = 0; gameIndex < gamesCount; gameIndex += 1) {
        const outcome = runGame(ALGORITHMS[xName], ALGORITHMS[oName]);
        allTurnStats.push(...outcome.turnStats);

        if (outcome.winner === 0) wins.x += 1;
        else if (outcome.winner === 1) wins.o += 1;
        else wins.draw += 1;
    }

    const summary: Record<string, PlayerSummary> = {};

    const xTurns = allTurnStats.filter((t) => t.player === 0);
    const xNodes = xTurns.reduce((sum, t) => sum + t.nodes, 0);
    const xMs = xTurns.reduce((sum, t) => sum + t.durationMs, 0);
    summary[`${xName} (as X)`] = {
        totalNodes: xNodes,
        avgNodesPerTurn:
            xTurns.length > 0 ? Math.round(xNodes / xTurns.length) : 0,
        avgMsPerTurn:
            xTurns.length > 0 ? Number((xMs / xTurns.length).toFixed(2)) : 0,
        totalTurns: xTurns.length,
    };

    const oTurns = allTurnStats.filter((t) => t.player === 1);
    const oNodes = oTurns.reduce((sum, t) => sum + t.nodes, 0);
    const oMs = oTurns.reduce((sum, t) => sum + t.durationMs, 0);
    summary[`${oName} (as O)`] = {
        totalNodes: oNodes,
        avgNodesPerTurn:
            oTurns.length > 0 ? Math.round(oNodes / oTurns.length) : 0,
        avgMsPerTurn:
            oTurns.length > 0 ? Number((oMs / oTurns.length).toFixed(2)) : 0,
        totalTurns: oTurns.length,
    };

    return {
        matchup: `${xName} (X) vs ${oName} (O)`,
        gamesPlayed: gamesCount,
        wins,
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
        console.log(
            `Result: ${xName} wins ${result.wins.x}, ${oName} wins ${result.wins.o}, Draws: ${result.wins.draw}\n`,
        );
    }

    mkdirSync(RESULTS_DIR, { recursive: true });
    writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
    console.log(`Benchmark completed. Results written to ${RESULTS_FILE}`);
};

void main();
