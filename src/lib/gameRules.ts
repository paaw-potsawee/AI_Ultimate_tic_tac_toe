import type { GameState } from "@/types/game";
import type { WinLineType } from "@/types/winLine";

export const BOARD_CELL_COUNT = 9;
export const FREE_CHOICE_BOARD = BOARD_CELL_COUNT;
export const FULL_BOARD_MASK = (1 << BOARD_CELL_COUNT) - 1;

export const WIN_LINES = [
    { mask: 0b000000111, type: "row-0" },
    { mask: 0b000111000, type: "row-1" },
    { mask: 0b111000000, type: "row-2" },
    { mask: 0b001001001, type: "col-0" },
    { mask: 0b010010010, type: "col-1" },
    { mask: 0b100100100, type: "col-2" },
    { mask: 0b100010001, type: "diag-main" },
    { mask: 0b001010100, type: "diag-anti" },
] as const satisfies readonly { mask: number; type: WinLineType }[];

export const WIN_MASKS: readonly number[] = WIN_LINES.map(({ mask }) => mask);

export const isBoardFull = (boardMask: number): boolean =>
    boardMask === FULL_BOARD_MASK;

export const isLocalBoardFull = (
    state: GameState,
    boardIndex: number,
): boolean => isBoardFull(state.x[boardIndex] | state.o[boardIndex]);

export const isLocalBoardWon = (
    state: GameState,
    boardIndex: number,
): boolean => ((state.wonX | state.wonO) & (1 << boardIndex)) !== 0;

export const isLocalBoardClosed = (
    state: GameState,
    boardIndex: number,
): boolean =>
    isLocalBoardWon(state, boardIndex) || isLocalBoardFull(state, boardIndex);

export const areAllLocalBoardsClosed = (state: GameState): boolean => {
    for (let boardIndex = 0; boardIndex < BOARD_CELL_COUNT; boardIndex += 1) {
        if (!isLocalBoardClosed(state, boardIndex)) return false;
    }

    return true;
};
