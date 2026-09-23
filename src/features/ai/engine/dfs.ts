import type { GameState, Player } from "@/features/board/types/game";
import {
    getAvailableMoves,
    checkGameWinner,
    applyMove,
} from "@/features/board/game";
import { BOARD_CELL_COUNT } from "@/features/board/gameRules";
import type { SearchContext } from "./shared/types";
import { visitNode } from "./shared/utils";
import { SEARCH_TIMEOUT } from "./shared/constants";
// borrow constant / scoring system from heuristic search for leaf in blind search
import { WIN_SCORE } from "./heuristic/constants";
import { calculateScore } from "./heuristic/evaluation";
import { BoundedTranspositionTable } from "./shared/transpositionTable";
import { getZobristKey } from "./shared/zobrist";

const TIME_BUDGET_MS = 1000;

const minimaxScore = (
    player: Player,
    currentBest: number,
    score: number,
): number => {
    if (player === 0) return Math.max(currentBest, score);
    return Math.min(currentBest, score);
};

const minimaxComp = (
    player: Player,
    currentBest: number,
    score: number,
): boolean => {
    if (player === 0) return score > currentBest;
    return score < currentBest;
};

const dfs = (
    state: GameState,
    depth: number,
    context: SearchContext,
): number => {
    visitNode(context);
    // only calculate score when hit terminal state (leaf or depth limit)
    // borrow scoring system from heuristic search to help evaluate this state
    const winner = checkGameWinner(state);
    if (winner !== null) {
        // score is zero when draw
        console.log(`found terminal state ${winner}`);
        if (winner === -1) return 0;
        return winner === 0 ? WIN_SCORE : -WIN_SCORE;
    }
    // non leaf node but hit depth limit
    if (depth === 0) {
        return -calculateScore(state);
    }
    // check cache
    const key = getZobristKey(state);
    const cached = context.table.get(key);
    if (cached && cached.depth >= depth) {
        return cached.value;
    }

    const moves = getAvailableMoves(state);
    let bestScore = state.player === 0 ? -Infinity : Infinity;
    // fall back in no moves left return a draw score
    if (moves.length === 0) return 0;
    moves.forEach((move) => {
        // simulate play by apply next move
        const boardIdx = Math.floor(move / BOARD_CELL_COUNT);
        const cellIdx = move % BOARD_CELL_COUNT;
        const nextState = applyMove(state, boardIdx, cellIdx);
        const currentScore = dfs(nextState, depth - 1, context);
        bestScore = minimaxScore(state.player, bestScore, currentScore);
    });
    context.table.set(key, {
        value: bestScore,
        depth,
        bestMove: null,
        flag: "EXACT",
    });

    return bestScore;
};

export const evaluateDFS = (state: GameState, depth: number): number | null => {
    const availableMoves = getAvailableMoves(state);
    if (availableMoves.length === 0) {
        return null;
    }

    let bestMove: number | null = null;
    const deadline = performance.now() + TIME_BUDGET_MS;
    const context: SearchContext = {
        deadline,
        nodes: 0,
        table: new BoundedTranspositionTable(),
    };
    for (let i = 0; i < depth; i++) {
        if (performance.now() >= context.deadline) break;
        let bestScore = state.player === 0 ? -Infinity : Infinity;
        let bestLocalMove: number | null = null;
        try {
            for (const move of availableMoves) {
                const boardIdx = Math.floor(move / BOARD_CELL_COUNT);
                const cellIdx = move % BOARD_CELL_COUNT;
                const nextState = applyMove(state, boardIdx, cellIdx);
                const score = dfs(nextState, i, context);
                if (minimaxComp(state.player, bestScore, score)) {
                    bestLocalMove = move;
                }
                if (
                    (state.player === 0 && score >= WIN_SCORE) ||
                    (state.player === 1 && score <= -WIN_SCORE)
                )
                    return bestLocalMove;
                bestScore = minimaxScore(state.player, bestScore, score);
            }
        } catch (error) {
            console.log("search time out bla bla ", i);
            if (error !== SEARCH_TIMEOUT) throw error;
            break;
        }
        // assume that deeper search always get better result
        bestMove = bestLocalMove;
    }
    // fallback to first move if all moves lead to a loss
    return bestMove ?? availableMoves[0];
};
