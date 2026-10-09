import type { Move } from "../types/game";
import type { ReviewSnapshot } from "../types/review";
import {
    applyMove,
    checkGameWinner,
    getAvailableLocalBoards,
    getGameWinningLine,
    getUltimateBoard,
    toRenderBoard,
} from "../game";
import { emit, store } from "./boardStoreState";

/**
 * Rebuilds the position reached right after `history[moveIndex]` by replaying
 * the move list from an empty board. This is purely presentational: it never
 * touches the live game state or the AI.
 */
export const buildReviewSnapshot = (
    history: readonly Move[],
    moveIndex: number,
): ReviewSnapshot => {
    let state = getUltimateBoard();
    for (let index = 0; index <= moveIndex; index += 1) {
        const { board, cell } = history[index];
        state = applyMove(state, board, cell);
    }

    const winner = checkGameWinner(state);
    const replayed = history.slice(0, moveIndex + 1);

    return {
        moveIndex,
        moveNumber: moveIndex + 1,
        move: history[moveIndex],
        board: toRenderBoard(state),
        gameWinningLine: getGameWinningLine(state),
        availableLocalBoards:
            winner === null ? getAvailableLocalBoards(state, replayed) : [],
        winner,
    };
};

/** Shows the board as it was right after the given move (0-based index). */
export const reviewMove = (moveIndex: number): void => {
    if (moveIndex < 0 || moveIndex >= store.history.length) return;
    if (store.reviewSnapshot?.moveIndex === moveIndex) return;

    store.reviewSnapshot = buildReviewSnapshot(store.history, moveIndex);
    emit();
};

/** Returns the board to the live game. */
export const exitReview = (): void => {
    if (store.reviewSnapshot === null) return;
    store.reviewSnapshot = null;
    emit();
};

/** Drops the review without emitting; callers emit after their own update. */
export const clearReview = (): void => {
    store.reviewSnapshot = null;
};

/**
 * After the history shrinks (undo), a review pointing past the end is no
 * longer meaningful, so it is dropped. Callers emit afterwards.
 */
export const syncReviewWithHistory = (): void => {
    if (
        store.reviewSnapshot !== null &&
        store.reviewSnapshot.moveIndex >= store.history.length
    ) {
        store.reviewSnapshot = null;
    }
};
