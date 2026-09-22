import type { GameState } from "@/features/board/types/game";
import { applyMove, checkGameWinner } from "@/features/board/game";
import { BOARD_CELL_COUNT } from "@/features/board/gameRules";
import { POSITION_WEIGHTS } from "./constants";
import type { OrderedMove } from "./types";

export const getMovePriority = (
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

    // Sending opponent to a free-choice turn is undesirable.
    if (nextState.nextBoard === 9) priority -= 10_000;

    return priority;
};

export const getOrderedMoves = (
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
