import type { GameState } from "@/features/board/types/game";
import { checkGameWinner, getAvailableMoves } from "@/features/board/game";
import {
    MAX_DEPTH,
    SEARCH_TIMEOUT,
    TIME_BUDGET_MS,
    TRANSPOSITION_TABLE_LIMIT,
    WIN_SCORE,
} from "./heuristic/constants";
import { calculateScore, getTerminalScore } from "./heuristic/evaluation";
import { getOrderedMoves } from "./heuristic/moveOrdering";
import type {
    SearchContext,
    SearchResult,
    TranspositionEntry,
    TranspositionFlag,
} from "./heuristic/types";
import { getZobristHash } from "./heuristic/zobrist";

const checkDeadline = (context: SearchContext, force = false): void => {
    context.nodes += 1;
    // Checking every 64 nodes amortizes performance.now() call overhead.
    if (
        (force || (context.nodes & 63) === 0) &&
        performance.now() >= context.deadline
    ) {
        throw SEARCH_TIMEOUT;
    }
};

const storeTransposition = (
    context: SearchContext,
    key: number,
    entry: TranspositionEntry,
): void => {
    const existing = context.table.get(key);
    if (
        !existing ||
        entry.depth >= existing.depth ||
        context.table.size < TRANSPOSITION_TABLE_LIMIT
    ) {
        context.table.set(key, entry);
    }
};

const minimax = (
    state: GameState,
    depth: number,
    alpha: number,
    beta: number,
    context: SearchContext,
): number => {
    checkDeadline(context);

    const terminalScore = getTerminalScore(checkGameWinner(state), depth);
    if (terminalScore !== null) return terminalScore;
    if (depth === 0) return calculateScore(state);

    const key = getZobristHash(state);
    const cached = context.table.get(key);
    const originalAlpha = alpha;
    const originalBeta = beta;

    if (cached) {
        // bestMove is valid for move ordering even if entry depth is insufficient to prune value.
        if (cached.depth >= depth) {
            if (cached.flag === "EXACT") return cached.value;
            if (cached.flag === "LOWER") alpha = Math.max(alpha, cached.value);
            else beta = Math.min(beta, cached.value);

            if (alpha >= beta) return cached.value;
        }
    }

    const legalMoves = getAvailableMoves(state);
    if (legalMoves.length === 0) return 0;

    const orderedMoves = getOrderedMoves(
        state,
        legalMoves,
        cached?.bestMove ?? null,
    );
    const isMaximizing = state.player === 1;
    let bestValue = isMaximizing ? -Infinity : Infinity;
    let bestMove: number | null = null;

    for (const candidate of orderedMoves) {
        const value = minimax(candidate.state, depth - 1, alpha, beta, context);

        if (
            bestMove === null ||
            (isMaximizing ? value > bestValue : value < bestValue)
        ) {
            bestValue = value;
            bestMove = candidate.move;
        }

        if (isMaximizing) alpha = Math.max(alpha, bestValue);
        else beta = Math.min(beta, bestValue);

        if (alpha >= beta) break;
    }

    let flag: TranspositionFlag = "EXACT";
    if (bestValue <= originalAlpha) flag = "UPPER";
    else if (bestValue >= originalBeta) flag = "LOWER";

    storeTransposition(context, key, {
        value: bestValue,
        flag,
        bestMove,
        depth,
    });
    return bestValue;
};

const searchAtDepth = (
    state: GameState,
    legalMoves: number[],
    depth: number,
    preferredMove: number | null,
    context: SearchContext,
): SearchResult => {
    const isMaximizing = state.player === 1;
    const orderedMoves = getOrderedMoves(state, legalMoves, preferredMove);
    let bestMove = orderedMoves[0].move;
    let bestValue = isMaximizing ? -Infinity : Infinity;
    let alpha = -Infinity;
    let beta = Infinity;

    for (const candidate of orderedMoves) {
        checkDeadline(context, true);
        const value = minimax(candidate.state, depth - 1, alpha, beta, context);

        if (isMaximizing ? value > bestValue : value < bestValue) {
            bestValue = value;
            bestMove = candidate.move;
        }

        if (isMaximizing) alpha = Math.max(alpha, bestValue);
        else beta = Math.min(beta, bestValue);
    }

    return { move: bestMove, value: bestValue };
};

export const evaluateHeuristic = (state: GameState): number | null => {
    if (checkGameWinner(state) !== null) return null;

    const availableMoves = getAvailableMoves(state);
    if (availableMoves.length === 0) return null;
    if (availableMoves.length === 1) return availableMoves[0];

    const deadline = performance.now() + TIME_BUDGET_MS;
    const fallbackMove = getOrderedMoves(state, availableMoves)[0].move;
    const context: SearchContext = {
        deadline,
        nodes: 0,
        table: new Map(),
    };
    let bestMove = fallbackMove;
    let preferredMove: number | null = null;

    for (let depth = 1; depth <= MAX_DEPTH; depth += 1) {
        if (performance.now() >= context.deadline) break;

        try {
            const result = searchAtDepth(
                state,
                availableMoves,
                depth,
                preferredMove,
                context,
            );
            bestMove = result.move;
            preferredMove = result.move;

            if (Math.abs(result.value) >= WIN_SCORE) break;
        } catch (error) {
            if (error !== SEARCH_TIMEOUT) throw error;
            break;
        }
    }

    return availableMoves.includes(bestMove) ? bestMove : fallbackMove;
};
