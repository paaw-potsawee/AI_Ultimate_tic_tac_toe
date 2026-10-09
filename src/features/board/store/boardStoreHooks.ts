import { useSyncExternalStore } from "react";
import { GameMode } from "@/types/gameMode";
import { store, listeners, optionListeners } from "./boardStoreState";
import {
    back,
    clearBoard,
    handleCellClick,
    leaveGame,
    retryAiMove,
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
    const aiError = useSyncExternalStore(
        (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        () => store.aiError,
    );

    // True when a click on an empty, reachable cell would place a mark right
    // now: the game is live, it is a human side's turn and nothing is pending.
    const canHumanMove =
        store.winner === null &&
        !isAiTurn &&
        review === null &&
        store.option !== GameMode.AIVAI &&
        (store.option === GameMode.PVP ||
            store.currentPlayer === store.humanPlayer);

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
        aiError,
        retryAiMove,
        canHumanMove,
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
