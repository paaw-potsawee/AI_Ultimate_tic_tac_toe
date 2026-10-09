import { useSyncExternalStore } from "react";
import { store, listeners, optionListeners } from "./boardStoreState";
import {
    back,
    clearBoard,
    handleCellClick,
    leaveGame,
    startGame,
    togglePause,
} from "./boardStoreController";
import { exitReview, reviewMove } from "./boardStoreReview";
import { setHumanPlayer, setMode } from "./boardStoreConfig";

export const useBoardStore = () => {
    const board = useSyncExternalStore(
        (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        () => store.boardSnapshot,
    );
    const isAiTurn = useSyncExternalStore(
        (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        () => store.isAiTurn,
    );
    const gameWinningLine = useSyncExternalStore(
        (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        () => store.gameWinningLineSnapshot,
    );
    const aiStatsSnapshot = useSyncExternalStore(
        (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        () => store.aiStatsSnapshot,
    );
    const isPaused = useSyncExternalStore(
        (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        () => store.isPaused,
    );
    const review = useSyncExternalStore(
        (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        () => store.reviewSnapshot,
    );

    return {
        board,
        clearBoard,
        handleCellClick,
        back,
        currentPlayer: store.currentPlayer === 0 ? "X" : "O",
        winner: store.winner,
        gameWinningLine,
        history: store.history,
        availableLocalBoards: store.availableLocalBoards,
        isAiTurn,
        aiStatsSnapshot,
        isPaused,
        togglePause,
        review,
        reviewMove,
        exitReview,
    };
};

export const useGameConfigStore = () => {
    const mode = useSyncExternalStore(
        (listener) => {
            optionListeners.add(listener);
            return () => optionListeners.delete(listener);
        },
        () => store.option,
    );
    const humanPlayer = useSyncExternalStore(
        (listener) => {
            optionListeners.add(listener);
            return () => optionListeners.delete(listener);
        },
        () => store.humanPlayer,
    );
    const aiPlayers = useSyncExternalStore(
        (listener) => {
            optionListeners.add(listener);
            return () => optionListeners.delete(listener);
        },
        () => store.aiPlayers,
    );

    return {
        mode,
        setMode,
        humanPlayer,
        aiPlayers,
        setHumanPlayer,
        startGame,
        leaveGame,
    };
};
