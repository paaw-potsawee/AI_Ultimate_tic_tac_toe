import type { GameResult, GameState } from "@/types/game";
import { applyMove, checkGameWinner, getAvailableMoves } from "@/lib/game";
import {
    BOARD_CELL_COUNT,
    FREE_CHOICE_BOARD,
    FULL_BOARD_MASK,
    isLocalBoardFull,
    WIN_MASKS,
} from "@/lib/gameRules";

const WIN_SCORE = 1_000_000;
const MAX_DEPTH = 10;
const TIME_BUDGET_MS = 900;
const TRANSPOSITION_TABLE_LIMIT = 100_000;

const POSITION_WEIGHTS = [3, 2, 3, 2, 4, 2, 3, 2, 3] as const;

const CAPTURED_BOARD_SCORE = 2_000;
const MACRO_ONE_IN_LINE_SCORE = 1_000;
const MACRO_TWO_IN_LINE_SCORE = 30_000;
const LOCAL_ONE_IN_LINE_SCORE = 15;
const LOCAL_TWO_IN_LINE_SCORE = 200;
const POSITION_SCORE = 2;
const FREE_MOVE_SCORE = 300;

const SEARCH_TIMEOUT = Symbol("search-timeout");

type TranspositionFlag = "EXACT" | "LOWER" | "UPPER";

interface TranspositionEntry {
    value: number;
    flag: TranspositionFlag;
    bestMove: number | null;
}

interface SearchContext {
    deadline: number;
    nodes: number;
    table: Map<string, TranspositionEntry>;
}

interface OrderedMove {
    move: number;
    state: GameState;
    priority: number;
}

interface SearchResult {
    move: number;
    value: number;
}

const countBits = (value: number): number => {
    let remaining = value & FULL_BOARD_MASK;
    let count = 0;

    while (remaining !== 0) {
        remaining &= remaining - 1;
        count += 1;
    }

    return count;
};

const getTerminalScore = (
    winner: GameResult,
    remainingDepth: number,
): number | null => {
    if (winner === 1) return WIN_SCORE + remainingDepth;
    if (winner === 0) return -WIN_SCORE - remainingDepth;
    if (winner === -1) return 0;
    return null;
};

const getLineScore = (
    oCount: number,
    xCount: number,
    oneInLineScore: number,
    twoInLineScore: number,
): number => {
    if (oCount > 0 && xCount > 0) return 0;
    if (oCount === 2) return twoInLineScore;
    if (xCount === 2) return -twoInLineScore;
    if (oCount === 1) return oneInLineScore;
    if (xCount === 1) return -oneInLineScore;
    return 0;
};

const calculateLocalBoardScore = (
    state: GameState,
    boardIndex: number,
): number => {
    const xBoard = state.x[boardIndex];
    const oBoard = state.o[boardIndex];
    let score = 0;

    for (const lineMask of WIN_MASKS) {
        score += getLineScore(
            countBits(oBoard & lineMask),
            countBits(xBoard & lineMask),
            LOCAL_ONE_IN_LINE_SCORE,
            LOCAL_TWO_IN_LINE_SCORE,
        );
    }

    for (let cellIndex = 0; cellIndex < BOARD_CELL_COUNT; cellIndex += 1) {
        const cellBit = 1 << cellIndex;
        const positionScore = POSITION_SCORE * POSITION_WEIGHTS[cellIndex];

        if ((oBoard & cellBit) !== 0) score += positionScore;
        else if ((xBoard & cellBit) !== 0) score -= positionScore;
    }

    return score * POSITION_WEIGHTS[boardIndex];
};

// Positive scores favor O (Player 1); negative scores favor X (Player 0).
const calculateScore = (state: GameState): number => {
    let score = 0;
    let drawnBoards = 0;

    for (let boardIndex = 0; boardIndex < BOARD_CELL_COUNT; boardIndex += 1) {
        const boardBit = 1 << boardIndex;
        const boardWeight = POSITION_WEIGHTS[boardIndex];

        if ((state.wonO & boardBit) !== 0) {
            score += CAPTURED_BOARD_SCORE * boardWeight;
        } else if ((state.wonX & boardBit) !== 0) {
            score -= CAPTURED_BOARD_SCORE * boardWeight;
        } else if (isLocalBoardFull(state, boardIndex)) {
            // A drawn local board blocks both players' global winning lines.
            drawnBoards |= boardBit;
        } else {
            score += calculateLocalBoardScore(state, boardIndex);
        }
    }

    for (const lineMask of WIN_MASKS) {
        if ((drawnBoards & lineMask) !== 0) continue;

        score += getLineScore(
            countBits(state.wonO & lineMask),
            countBits(state.wonX & lineMask),
            MACRO_ONE_IN_LINE_SCORE,
            MACRO_TWO_IN_LINE_SCORE,
        );
    }

    if (state.nextBoard === FREE_CHOICE_BOARD) {
        score += state.player === 1 ? FREE_MOVE_SCORE : -FREE_MOVE_SCORE;
    }

    return score;
};

const getStateKey = (state: GameState, depth: number): string =>
    `${depth}|${state.player}|${state.nextBoard}|${state.wonX}|${state.wonO}|${state.x.join(",")}|${state.o.join(",")}`;

const checkDeadline = (context: SearchContext, force = false): void => {
    context.nodes += 1;

    // Checking periodically avoids making performance.now() a hot-path bottleneck.
    if (
        (force || (context.nodes & 63) === 0) &&
        performance.now() >= context.deadline
    ) {
        throw SEARCH_TIMEOUT;
    }
};

const getMovePriority = (
    previousState: GameState,
    nextState: GameState,
    move: number,
    preferredMove: number | null,
): number => {
    const player = previousState.player;
    const boardIndex = Math.floor(move / BOARD_CELL_COUNT);
    const cellIndex = move % BOARD_CELL_COUNT;
    const previousWonBoards =
        player === 1 ? previousState.wonO : previousState.wonX;
    const nextWonBoards = player === 1 ? nextState.wonO : nextState.wonX;
    let priority =
        POSITION_WEIGHTS[cellIndex] * 10 + POSITION_WEIGHTS[boardIndex];

    if (checkGameWinner(nextState) === player) priority += 4_000_000;
    if (preferredMove === move) priority += 2_000_000;

    if ((nextWonBoards & ~previousWonBoards) !== 0) {
        priority += 100_000 * POSITION_WEIGHTS[boardIndex];
    }

    // Sending the opponent to a free-choice turn is usually undesirable.
    if (nextState.nextBoard === FREE_CHOICE_BOARD) priority -= 10_000;

    return priority;
};

const getOrderedMoves = (
    state: GameState,
    legalMoves: number[],
    preferredMove: number | null = null,
): OrderedMove[] => {
    const orderedMoves = legalMoves.map((move) => {
        const boardIndex = Math.floor(move / BOARD_CELL_COUNT);
        const cellIndex = move % BOARD_CELL_COUNT;
        const nextState = applyMove(state, state.player, boardIndex, cellIndex);

        return {
            move,
            state: nextState,
            priority: getMovePriority(state, nextState, move, preferredMove),
        };
    });

    orderedMoves.sort((a, b) => b.priority - a.priority || a.move - b.move);
    return orderedMoves;
};

const storeTransposition = (
    context: SearchContext,
    key: string,
    entry: TranspositionEntry,
): void => {
    if (
        context.table.has(key) ||
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

    const key = getStateKey(state, depth);
    const cached = context.table.get(key);
    const originalAlpha = alpha;
    const originalBeta = beta;

    if (cached) {
        if (cached.flag === "EXACT") return cached.value;
        if (cached.flag === "LOWER") alpha = Math.max(alpha, cached.value);
        else beta = Math.min(beta, cached.value);

        if (alpha >= beta) return cached.value;
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

    storeTransposition(context, key, { value: bestValue, flag, bestMove });
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

        // Entries from another iteration use a different remaining depth, so
        // they cannot be reused safely and would only consume the table limit.
        context.table.clear();

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

            // A proven terminal result cannot be improved by searching deeper.
            if (Math.abs(result.value) >= WIN_SCORE) break;
        } catch (error) {
            if (error !== SEARCH_TIMEOUT) throw error;
            break;
        }
    }

    return availableMoves.includes(bestMove) ? bestMove : fallbackMove;
};
