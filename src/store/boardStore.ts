import { useSyncExternalStore } from "react";
import type { CellPosition } from "@/types/board";
import type { Move, Player } from "@/types/game";
import {
    applyMove,
    checkGameWinner,
    getAvailableLocalBoards,
    getUltimateBoard,
    isAvailableCell,
    toRenderBoard,
    back,
} from "@/lib/game";
import { GameMode, type GameModeValue } from "@/types/gameMode";
import { getAiMove } from "@/lib/ai";

let state = getUltimateBoard();
let currentPlayer: Player = 0;
let winner: Player | null = null;
let history: Move[] = [];
let availableLocalBoards: CellPosition[] = getAvailableLocalBoards(
    state,
    history,
);
let option: GameModeValue = 1;
let boardSnapshot = toRenderBoard(state);
let humanPlayer: Player = 0;
let isAiTurn = false;
let aiTimer: ReturnType<typeof setTimeout> | null = null;

const listeners: Set<() => void> = new Set();
const optionListeners: Set<() => void> = new Set();

const emit = () => {
    listeners.forEach((cb) => cb());
};

const refreshAvailableBoards = () => {
    availableLocalBoards = getAvailableLocalBoards(state, history);
    boardSnapshot = toRenderBoard(state);
};

const doAiMove = () => {
    if (winner !== null || option === GameMode.PVP) return;

    isAiTurn = true;
    emit();

    aiTimer = setTimeout(() => {
        aiTimer = null;
        if (!isAiTurn) return;

        const move = getAiMove(state, option);
        const nextState = applyMove(
            state,
            currentPlayer,
            move.board,
            move.cell,
        );

        history = [
            ...history,
            {
                player: currentPlayer,
                localRow: Math.floor(move.board / 3),
                localCol: move.board % 3,
                cellRow: Math.floor(move.cell / 3),
                cellCol: move.cell % 3,
                board: move.board,
                cell: move.cell,
            },
        ];

        winner = checkGameWinner(nextState);
        state = nextState;
        currentPlayer = nextState.player;
        isAiTurn = false;
        refreshAvailableBoards();
        emit();
    }, 999);
};

const BoardStore = {
    subscribe(cb: () => void) {
        listeners.add(cb);
        return () => listeners.delete(cb);
    },
    getBoard() {
        return boardSnapshot;
    },
    getIsAiTurn() {
        return isAiTurn;
    },
    subscribeOption(cb: () => void) {
        optionListeners.add(cb);
        return () => optionListeners.delete(cb);
    },
    getOption() {
        return option;
    },
    setOption(newOption: GameModeValue) {
        if (newOption === option) return;
        option = newOption;
        optionListeners.forEach((cb) => cb());
    },
    getHumanPlayer() {
        return humanPlayer;
    },
    setHumanPlayer(player: Player) {
        if (humanPlayer === player) return;
        humanPlayer = player;
        optionListeners.forEach((cb) => cb());
    },
    startGame(newOption: GameModeValue, newHumanPlayer: Player) {
        option = newOption;
        humanPlayer = newHumanPlayer;
        optionListeners.forEach((cb) => cb());
        BoardStore.clearBoard();
    },
    leaveGame() {
        if (aiTimer !== null) {
            clearTimeout(aiTimer);
            aiTimer = null;
        }
        isAiTurn = false;
    },
    clearBoard() {
        BoardStore.leaveGame();
        state = getUltimateBoard();
        currentPlayer = 0;
        winner = null;
        history = [];
        isAiTurn = false;
        refreshAvailableBoards();
        emit();
        if (option !== GameMode.PVP && currentPlayer !== humanPlayer) {
            doAiMove();
        }
    },
    handleCellClick({ localRow, localCol, cellRow, cellCol }: CellPosition) {
        if (winner !== null || isAiTurn) {
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
                player: currentPlayer,
                localRow,
                localCol,
                cellRow,
                cellCol,
                board: boardIndex,
                cell: cellIndex,
            },
        ];

        winner = checkGameWinner(nextState);
        state = nextState;
        currentPlayer = nextState.player;
        refreshAvailableBoards();
        emit();

        if (
            option !== GameMode.PVP &&
            winner === null &&
            currentPlayer !== humanPlayer
        ) {
            doAiMove();
        }
    },
    back() {
        if (history.length === 0 || isAiTurn) {
            return;
        }
        let result = back(state, history);
        state = result.state;
        history = result.history;

        if (option !== GameMode.PVP && history.length > 0) {
            result = back(state, history);
            state = result.state;
            history = result.history;
        }

        currentPlayer = state.player;
        winner = checkGameWinner(state);
        isAiTurn = false;
        refreshAvailableBoards();
        emit();
    },
};

export const useBoardStore = () => {
    const board = useSyncExternalStore(
        BoardStore.subscribe,
        BoardStore.getBoard,
    );
    const isAiTurn = useSyncExternalStore(
        BoardStore.subscribe,
        BoardStore.getIsAiTurn,
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
        isAiTurn,
    };
};

export const useGameConfigStore = () => {
    const option = useSyncExternalStore(
        BoardStore.subscribeOption,
        BoardStore.getOption,
    );
    const humanPlayer = useSyncExternalStore(
        BoardStore.subscribeOption,
        BoardStore.getHumanPlayer,
    );

    return {
        mode: option,
        setMode: BoardStore.setOption,
        humanPlayer,
        setHumanPlayer: BoardStore.setHumanPlayer,
        startGame: BoardStore.startGame,
        leaveGame: BoardStore.leaveGame,
    };
};
