import {
    type LocalBoard,
    type Move,
    type UltimateBoard,
    type CellClickProps,
} from "../types/board";
import { type MoveRecord } from "../types/game";

export const getLocalBoard = (): LocalBoard => ({
    board: Array.from({ length: 3 }, () => Array<Move>(3).fill(null)),
    winner: null,
});

export const getUltimateBoard = (): UltimateBoard =>
    Array.from({ length: 3 }, () =>
        Array.from({ length: 3 }, () => getLocalBoard()),
    );

export const cloneUltimateBoard = (board: UltimateBoard): UltimateBoard =>
    board.map((localRow) =>
        localRow.map((localBoard) => ({
            ...localBoard,
            board: localBoard.board.map((row) => [...row]),
        })),
    );

export const checkGameWinner = (board: UltimateBoard): Move => {
    // create move[][] map from localboard winners
    const moveMap: Move[][] = board.map((localRow) =>
        localRow.map((localBoard) => localBoard.winner),
    );
    return checkWinner(moveMap);
};

// create function to check move[][] map for winner
export const checkWinner = (moveMap: Move[][]): Move => {
    // check rows
    for (let i = 0; i < 3; i++) {
        if (
            moveMap[i][0] !== null &&
            moveMap[i][0] === moveMap[i][1] &&
            moveMap[i][1] === moveMap[i][2]
        ) {
            return moveMap[i][0];
        }
    }
    // check columns
    for (let i = 0; i < 3; i++) {
        if (
            moveMap[0][i] !== null &&
            moveMap[0][i] === moveMap[1][i] &&
            moveMap[1][i] === moveMap[2][i]
        ) {
            return moveMap[0][i];
        }
    }
    // check diagonals
    if (
        moveMap[0][0] !== null &&
        moveMap[0][0] === moveMap[1][1] &&
        moveMap[1][1] === moveMap[2][2]
    ) {
        return moveMap[0][0];
    }
    if (
        moveMap[0][2] !== null &&
        moveMap[0][2] === moveMap[1][1] &&
        moveMap[1][1] === moveMap[2][0]
    ) {
        return moveMap[0][2];
    }
    return null;
};

const hasPlayableCell = (board: LocalBoard): boolean =>
    board.winner === null &&
    board.board.some((row) => row.some((cell) => cell === null));

export const isAvailableCell = (
    coor: CellClickProps,
    ultimateBoard: UltimateBoard,
    history: MoveRecord[],
): boolean => {
    // check if local board is available
    const { localRow, localCol, cellRow, cellCol } = coor;
    const localBoard = ultimateBoard[localRow][localCol];

    if (localBoard.winner !== null) return false;
    if (localBoard.board[cellRow][cellCol] !== null) return false;

    // check if the move is valid based on the last move
    if (history.length > 0) {
        const lastMove = history[history.length - 1];
        const requiredRow = lastMove.cellRow;
        const requiredCol = lastMove.cellCol;

        if (requiredRow !== localRow || requiredCol !== localCol) {
            const requiredLocalBoard = ultimateBoard[requiredRow][requiredCol];
            if (hasPlayableCell(requiredLocalBoard)) {
                return false;
            }
        }
    }
    return true;
};

export const getAvailableLocalBoards = (
    ultimateBoard: UltimateBoard,
    history: MoveRecord[],
): { localRow: number; localCol: number }[] => {
    const availableBoards: { localRow: number; localCol: number }[] = [];

    if (history.length > 0) {
        const lastMove = history[history.length - 1];
        const requiredRow = lastMove.cellRow;
        const requiredCol = lastMove.cellCol;

        const requiredLocalBoard = ultimateBoard[requiredRow][requiredCol];
        if (hasPlayableCell(requiredLocalBoard)) {
            availableBoards.push({
                localRow: requiredRow,
                localCol: requiredCol,
            });
            return availableBoards;
        }
    }

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (hasPlayableCell(ultimateBoard[i][j])) {
                availableBoards.push({ localRow: i, localCol: j });
            }
        }
    }

    return availableBoards;
};

export const back = (
    ultimateBoard: UltimateBoard,
    history: MoveRecord[],
): { ultimateBoard: UltimateBoard; history: MoveRecord[] } => {
    if (history.length === 0) {
        return { ultimateBoard, history };
    }

    const { localRow, localCol, cellRow, cellCol } =
        history.pop() as MoveRecord;

    // Clone the ultimate board to avoid mutating the original
    const newUltimateBoard = cloneUltimateBoard(ultimateBoard);
    newUltimateBoard[localRow][localCol].board[cellRow][cellCol] = null;
    newUltimateBoard[localRow][localCol].winner = checkWinner(
        newUltimateBoard[localRow][localCol].board,
    );
    history = [...history];
    return { ultimateBoard: newUltimateBoard, history };
};
