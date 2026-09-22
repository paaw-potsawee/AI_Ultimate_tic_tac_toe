import type { GameResult, GameState } from "@/features/board/types/game";
import {
    BOARD_CELL_COUNT,
    FREE_CHOICE_BOARD,
    FULL_BOARD_MASK,
    isLocalBoardClosed,
    isLocalBoardFull,
    WIN_MASKS,
} from "@/features/board/gameRules";
import {
    CAPTURED_BOARD_SCORE,
    FREE_MOVE_SCORE,
    FORCED_BOARD_SCORE_MULTIPLIER,
    LOCAL_ONE_IN_LINE_SCORE,
    LOCAL_TWO_IN_LINE_SCORE,
    MACRO_ONE_IN_LINE_SCORE,
    MACRO_TWO_IN_LINE_SCORE,
    POSITION_SCORE,
    POSITION_WEIGHTS,
    WIN_SCORE,
} from "./constants";

export const countBits = (value: number): number => {
    let remaining = value & FULL_BOARD_MASK;
    let count = 0;
    while (remaining !== 0) {
        remaining &= remaining - 1;
        count += 1;
    }
    return count;
};

// Positive scores favor O (player 1); negative scores favor X. remainingDepth prefers faster wins.
export const getTerminalScore = (
    winner: GameResult,
    remainingDepth: number,
): number | null => {
    if (winner === 1) return WIN_SCORE + remainingDepth;
    if (winner === 0) return -WIN_SCORE - remainingDepth;
    if (winner === -1) return 0;
    return null;
};

export const getLineScore = (
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

export const calculateLocalBoardScore = (
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

export const calculateScore = (state: GameState): number => {
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
    } else if (!isLocalBoardClosed(state, state.nextBoard)) {
        score +=
            calculateLocalBoardScore(state, state.nextBoard) *
            FORCED_BOARD_SCORE_MULTIPLIER;
    }

    return score;
};
