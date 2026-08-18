import { useSyncExternalStore } from "react";
import type { CellPosition } from "../types/board";
import { type Move, type Player } from "../types/game";
import {
    applyMove,
    checkGameWinner,
    getAvailableLocalBoards,
    getUltimateBoard,
    isAvailableCell,
    toRenderBoard,
    back,
} from "../lib/game";

let state = getUltimateBoard();
let currentPlayer: Player = 0;
let winner: Player | null = null;
let history: Move[] = [];
let availableLocalBoards: CellPosition[] = getAvailableLocalBoards(
    state,
    history,
);
let boardSnapshot = toRenderBoard(state);

const listeners: Set<() => void> = new Set();

const emit = () => {
    listeners.forEach((cb) => cb());
};

const refreshAvailableBoards = () => {
    availableLocalBoards = getAvailableLocalBoards(state, history);
    boardSnapshot = toRenderBoard(state);
};

const BoardStore = {
    subscribe(cb: () => void) {
        listeners.add(cb);
        return () => listeners.delete(cb);
    },
    getBoard() {
        return boardSnapshot;
    },
    clearBoard() {
        state = getUltimateBoard();
        currentPlayer = 0;
        winner = null;
        history = [];
        refreshAvailableBoards();
        emit();
    },
    handleCellClick({ localRow, localCol, cellRow, cellCol }: CellPosition) {
        if (winner !== null) {
            return;
        }
        if (
            !isAvailableCell(
                { localRow, localCol, cellRow, cellCol },
                state,
                history,
            )
        ) {
            return;
        }

        const boardIndex = localRow * 3 + localCol;
        const cellIndex = cellRow * 3 + cellCol;

        const nextState = applyMove(
            state,
            currentPlayer,
            boardIndex,
            cellIndex,
        );

        history = [
            ...history,
            {
                board: boardIndex,
                cell: cellIndex,
            },
        ];

        winner = checkGameWinner(nextState);
        state = nextState;
        currentPlayer = nextState.player;
        refreshAvailableBoards();
        emit();
    },
    back() {
        if (history.length === 0) {
            return;
        }
        const result = back(state, history);
        state = result.state;
        history = result.history;
        currentPlayer = state.player;
        winner = checkGameWinner(state);
        refreshAvailableBoards();
        emit();
    },
};

export const useBoardStore = () => {
    const board = useSyncExternalStore(
        BoardStore.subscribe,
        BoardStore.getBoard,
    );

    return {
        board,
        clearBoard: BoardStore.clearBoard,
        handleCellClick: BoardStore.handleCellClick,
        back: BoardStore.back,
        currentPlayer: currentPlayer === 0 ? "X" : "O",
        winner,
        history,
        availableLocalBoards,
    };
};
