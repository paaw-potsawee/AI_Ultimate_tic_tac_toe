import type { CellPosition, RenderBoard } from "@/types/board";
import type { GameState, Move, Player, GameResult } from "@/types/game";
import type { GameWinLine, WinLineType } from "@/types/winLine";

export const getUltimateBoard = (): GameState => {
    return {
        x: new Uint16Array(9),
        o: new Uint16Array(9),
        wonX: 0,
        wonO: 0,
        nextBoard: 9,
        player: 0,
    };
};

const WIN_LINES: { mask: number; type: WinLineType }[] = [
    { mask: 0b000000111, type: "row-0" },
    { mask: 0b000111000, type: "row-1" },
    { mask: 0b111000000, type: "row-2" },
    { mask: 0b001001001, type: "col-0" },
    { mask: 0b010010010, type: "col-1" },
    { mask: 0b100100100, type: "col-2" },
    { mask: 0b100010001, type: "diag-main" },
    { mask: 0b001010100, type: "diag-anti" },
];

export const getWinningLine = (boardMask: number): WinLineType | null => {
    const match = WIN_LINES.find(({ mask }) => (boardMask & mask) === mask);
    return match ? match.type : null;
};

const isBoardFull = (boardMask: number): boolean => {
    return boardMask === 0b111111111;
};

const getBoardIndexFromCell = (cellRow: number, cellCol: number): number => {
    return cellRow * 3 + cellCol;
};

export const getAvailableMoves = (state: GameState): number[] => {
    const availableMoves: number[] = [];
    const boards =
        state.nextBoard === 9 ? [0, 1, 2, 3, 4, 5, 6, 7, 8] : [state.nextBoard];

    for (const boardIndex of boards) {
        if (
            (state.wonX & (1 << boardIndex)) !== 0 ||
            (state.wonO & (1 << boardIndex)) !== 0 ||
            isBoardFull(state.x[boardIndex] | state.o[boardIndex])
        ) {
            continue;
        }

        for (let cellIndex = 0; cellIndex < 9; cellIndex += 1) {
            const bit = 1 << cellIndex;
            const isOccupied =
                (state.x[boardIndex] & bit) !== 0 ||
                (state.o[boardIndex] & bit) !== 0;
            if (!isOccupied) {
                availableMoves.push(boardIndex * 9 + cellIndex);
            }
        }
    }
    return availableMoves;
};

const getAvailableBoardIndex = (
    state: GameState,
    lastMove: Pick<Move, "cell">,
): number => {
    const cellRow = Math.floor(lastMove.cell / 3);
    const cellCol = lastMove.cell % 3;
    const forcedBoardIndex = getBoardIndexFromCell(cellRow, cellCol);

    if (
        (state.wonX & (1 << forcedBoardIndex)) !== 0 ||
        (state.wonO & (1 << forcedBoardIndex)) !== 0 ||
        isBoardFull(state.x[forcedBoardIndex] | state.o[forcedBoardIndex])
    ) {
        return 9;
    }
    return forcedBoardIndex;
};

export const cloneUltimateBoard = (state: GameState): GameState => {
    return {
        ...state,
        x: new Uint16Array(state.x),
        o: new Uint16Array(state.o),
    };
};

export const checkWinner = (board: number): boolean => {
    return WIN_LINES.some(({ mask }) => (board & mask) === mask);
};

export const checkGameWinner = (state: GameState): GameResult => {
    if (checkWinner(state.wonX)) return 0;
    if (checkWinner(state.wonO)) return 1;
    if (isBoardFull(state.wonX | state.wonO)) return -1;
    return null;
};

export const getGameWinningLine = (state: GameState): GameWinLine | null => {
    const xLine = getWinningLine(state.wonX);
    if (xLine) return { winner: 0, line: xLine };
    const oLine = getWinningLine(state.wonO);
    if (oLine) return { winner: 1, line: oLine };
    return null;
};

export const toRenderBoard = (state: GameState): RenderBoard => {
    const renderBoard: RenderBoard = Array.from({ length: 3 }, () =>
        Array.from({ length: 3 }, () => ({
            board: Array.from({ length: 3 }, () => Array(3).fill(null)),
            winner: null,
            winningLine: null,
        })),
    );

    for (let localBoard = 0; localBoard < 9; localBoard += 1) {
        const localRow = Math.floor(localBoard / 3);
        const localCol = localBoard % 3;

        for (let cell = 0; cell < 9; cell += 1) {
            const bit = 1 << cell;
            const cellRow = Math.floor(cell / 3);
            const cellCol = cell % 3;

            const isX = (state.x[localBoard] & bit) !== 0;
            const isO = (state.o[localBoard] & bit) !== 0;

            renderBoard[localRow][localCol].board[cellRow][cellCol] = isX
                ? "X"
                : isO
                  ? "O"
                  : null;
        }

        if ((state.wonX & (1 << localBoard)) !== 0) {
            renderBoard[localRow][localCol].winner = "X";
            renderBoard[localRow][localCol].winningLine = getWinningLine(
                state.x[localBoard],
            );
        } else if ((state.wonO & (1 << localBoard)) !== 0) {
            renderBoard[localRow][localCol].winner = "O";
            renderBoard[localRow][localCol].winningLine = getWinningLine(
                state.o[localBoard],
            );
        }
    }

    return renderBoard;
};

export const isAvailableCell = (
    pos: CellPosition,
    state: GameState,
    history: Move[],
): boolean => {
    const { localRow, localCol, cellRow, cellCol } = pos;
    const boardIndex = localRow * 3 + localCol;
    const cellIndex = cellRow * 3 + cellCol;

    if (boardIndex < 0 || boardIndex > 8) {
        return false;
    }

    if (state.nextBoard !== 9 && state.nextBoard !== boardIndex) {
        return false;
    }

    if (
        (state.wonX & (1 << boardIndex)) !== 0 ||
        (state.wonO & (1 << boardIndex)) !== 0
    ) {
        return false;
    }

    const occupied =
        (state.x[boardIndex] & (1 << cellIndex)) !== 0 ||
        (state.o[boardIndex] & (1 << cellIndex)) !== 0;
    if (occupied) {
        return false;
    }

    if (isBoardFull(state.x[boardIndex] | state.o[boardIndex])) {
        return false;
    }

    void history;
    return true;
};

export const getAvailableLocalBoards = (
    state: GameState,
    history: Move[],
): CellPosition[] => {
    void history;
    const boardPositions: CellPosition[] = [];

    const boards =
        state.nextBoard === 9 ? [0, 1, 2, 3, 4, 5, 6, 7, 8] : [state.nextBoard];

    for (const boardIndex of boards) {
        if (
            (state.wonX & (1 << boardIndex)) !== 0 ||
            (state.wonO & (1 << boardIndex)) !== 0
        ) {
            continue;
        }

        if (isBoardFull(state.x[boardIndex] | state.o[boardIndex])) {
            continue;
        }

        const localRow = Math.floor(boardIndex / 3);
        const localCol = boardIndex % 3;

        boardPositions.push({
            localRow,
            localCol,
            cellRow: 0,
            cellCol: 0,
        });
    }

    return boardPositions;
};

export const applyMove = (
    state: GameState,
    player: Player,
    boardIndex: number,
    cellIndex: number,
): GameState => {
    const nextState = cloneUltimateBoard(state);
    const bit = 1 << cellIndex;

    if (player === 0) {
        nextState.x[boardIndex] |= bit;
    } else {
        nextState.o[boardIndex] |= bit;
    }

    const localBoardMask =
        player === 0 ? nextState.x[boardIndex] : nextState.o[boardIndex];

    if (checkWinner(localBoardMask)) {
        if (player === 0) {
            nextState.wonX |= 1 << boardIndex;
        } else {
            nextState.wonO |= 1 << boardIndex;
        }
    }

    nextState.nextBoard = getAvailableBoardIndex(nextState, {
        cell: cellIndex,
    });

    nextState.player = player === 0 ? 1 : 0;
    return nextState;
};

export const back = (
    state: GameState,
    history: Move[],
): {
    state: GameState;
    history: Move[];
} => {
    if (history.length === 0) {
        return { state: cloneUltimateBoard(state), history };
    }

    const previousState = cloneUltimateBoard(state);
    const lastMove = history[history.length - 1];
    const cellBit = 1 << lastMove.cell;
    const board = lastMove.board;

    if (state.player === 1) {
        previousState.x[board] &= ~cellBit;
        previousState.player = 0;
        if (previousState.wonX & (1 << board)) {
            previousState.wonX &= ~(1 << board);
        }
    } else {
        previousState.o[board] &= ~cellBit;
        previousState.player = 1;
        if (previousState.wonO & (1 << board)) {
            previousState.wonO &= ~(1 << board);
        }
    }

    if (history.length === 1) {
        previousState.nextBoard = 9;
        return { state: previousState, history: [] };
    }
    const secondLastMove = history[history.length - 2];
    previousState.nextBoard = getAvailableBoardIndex(
        previousState,
        secondLastMove,
    );

    return { state: previousState, history: history.slice(0, -1) };
};
