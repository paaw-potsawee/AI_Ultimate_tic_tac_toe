import { useSyncExternalStore } from "react";
import { type MoveRecord } from "../types/game";
import {
    cloneUltimateBoard,
    getUltimateBoard,
    checkGameWinner,
    checkWinner,
    isAvailableCell,
    getAvailableLocalBoards,
    back,
} from "../lib/game";
import {
    type CellClickProps,
    type Player,
    type UltimateBoard,
} from "../types/board";

let board: UltimateBoard = getUltimateBoard();
let currentPlayer: Player = "X";
let availableLocalBoards: { localRow: number; localCol: number }[] = Array.from(
    { length: 3 },
    (_, row) =>
        Array.from({ length: 3 }, (_, col) => ({
            localRow: row,
            localCol: col,
        })),
).flat();

let winner: Player | null = null;
let history: MoveRecord[] = [];
const listeners: Set<() => void> = new Set();

const emit = () => {
    listeners.forEach((cb) => cb());
};

export const useBoardStore = () => {
    const store = useSyncExternalStore(
        BoardStore.subscribe,
        BoardStore.getBoard,
    );
    return {
        board: store,
        clearBoard: BoardStore.clearBoard,
        handleCellClick: BoardStore.handleCellClick,
        back: BoardStore.back,
        currentPlayer,
        winner,
        history,
        availableLocalBoards,
    };
};

const BoardStore = {
    subscribe(cb: () => void) {
        listeners.add(cb);
        return () => listeners.delete(cb);
    },
    getBoard() {
        return board;
    },
    clearBoard() {
        board = getUltimateBoard();
        availableLocalBoards = Array.from({ length: 3 }, (_, row) =>
            Array.from({ length: 3 }, (_, col) => ({
                localRow: row,
                localCol: col,
            })),
        ).flat();
        currentPlayer = "X";
        winner = null;
        history = [];
        emit();
    },
    handleCellClick({ localRow, localCol, cellRow, cellCol }: CellClickProps) {
        console.log(
            `Cell clicked: localRow=${localRow}, localCol=${localCol}, cellRow=${cellRow}, cellCol=${cellCol}`,
        );
        if (board[localRow][localCol].board[cellRow][cellCol] !== null) {
            return;
        }
        if (board[localRow][localCol].winner !== null) {
            return;
        }
        if (winner !== null) {
            return;
        }
        if (
            !isAvailableCell(
                { localRow, localCol, cellRow, cellCol },
                board,
                history,
            )
        ) {
            return;
        }

        // create new board and update the cell with current player
        const nextBoard = cloneUltimateBoard(board);
        nextBoard[localRow][localCol].board[cellRow][cellCol] = currentPlayer;

        // append move to history
        history = [
            ...history,
            { player: currentPlayer, localRow, localCol, cellRow, cellCol },
        ];

        // update available local boards based on the last move
        availableLocalBoards = getAvailableLocalBoards(nextBoard, history);

        // check local board winner
        const localWinner = checkWinner(nextBoard[localRow][localCol].board);
        nextBoard[localRow][localCol].winner = localWinner;

        // check ultimate board winner
        winner = checkGameWinner(nextBoard);
        board = nextBoard;
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        emit();
    },
    back() {
        const { ultimateBoard, history: newHistory } = back(board, history);
        board = ultimateBoard;
        history = newHistory;

        // update current player
        currentPlayer = history.length % 2 === 0 ? "X" : "O";
        // update available local boards based on the last move
        availableLocalBoards = getAvailableLocalBoards(board, history);
        // remove winner if the last move was a winning move
        winner = checkGameWinner(board);
        emit();
    },
};
