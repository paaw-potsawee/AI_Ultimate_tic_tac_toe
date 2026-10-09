import type { CellPosition } from "../types/board";
import type { Player } from "../types/game";
import {
    GameMode,
    type AiModeValue,
    type GameModeValue,
} from "@/types/gameMode";
import {
    applyMove,
    back as gameBack,
    checkGameWinner,
    isAvailableCell,
} from "../game";
import { cancelAiWork, doAiMove, startAiTurn } from "./boardStoreAi";
import { clearReview, syncReviewWithHistory } from "./boardStoreReview";
import {
    emit,
    optionListeners,
    refreshSnapshots,
    resetAiStats,
    store,
} from "./boardStoreState";

/** True when the side to move is controlled by an AI engine. */
const isAiToMove = (): boolean =>
    store.option === GameMode.AIVAI ||
    (store.option !== GameMode.PVP &&
        store.currentPlayer !== store.humanPlayer);

const resetState = (): void => {
    cancelAiWork();
    store.state = {
        x: new Uint16Array(9),
        o: new Uint16Array(9),
        wonX: 0,
        wonO: 0,
        nextBoard: 9,
        player: 0,
    };
    store.currentPlayer = 0;
    store.winner = null;
    store.history = [];
    store.isAiTurn = false;
    store.isPaused = false;
    store.aiError = null;
    clearReview();
    resetAiStats();
    refreshSnapshots();
};

export const clearBoard = (): void => {
    resetState();
    emit();
    startAiTurn(true);
};

export const startGame = (
    option: GameModeValue,
    humanPlayer: Player,
    aiPlayers?: readonly [AiModeValue, AiModeValue],
): void => {
    store.option = option;
    store.humanPlayer = humanPlayer;
    if (aiPlayers) store.aiPlayers = [...aiPlayers];
    optionListeners.forEach((listener) => listener());
    clearBoard();
};

export const leaveGame = (): void => {
    cancelAiWork();
    store.isPaused = false;
    store.aiError = null;
    clearReview();
    emit();
};

/**
 * AI vs AI only. Pausing cancels the pending or in-flight search so the match
 * stops right away; resuming simply asks the current side to move again.
 */
export const togglePause = (): void => {
    if (store.option !== GameMode.AIVAI) return;

    if (store.isPaused) {
        store.isPaused = false;
        emit();
        if (store.winner === null) startAiTurn(false);
        return;
    }

    if (store.winner !== null) return;
    cancelAiWork();
    store.isPaused = true;
    emit();
};

/** Asks the AI for a move again after a failed attempt left it idle. */
export const retryAiMove = (): void => {
    if (store.winner !== null || store.isAiTurn || !isAiToMove()) return;
    doAiMove();
};

export const handleCellClick = ({
    localRow,
    localCol,
    cellRow,
    cellCol,
}: CellPosition): void => {
    if (
        store.winner !== null ||
        store.isAiTurn ||
        store.reviewSnapshot !== null ||
        isAiToMove()
    ) {
        return;
    }

    const position = { localRow, localCol, cellRow, cellCol };
    if (!isAvailableCell(position, store.state, store.history)) return;

    const board = localRow * 3 + localCol;
    const cell = cellRow * 3 + cellCol;
    const nextState = applyMove(store.state, board, cell);

    store.history = [
        ...store.history,
        {
            player: store.currentPlayer,
            localRow,
            localCol,
            cellRow,
            cellCol,
            board,
            cell,
        },
    ];
    store.winner = checkGameWinner(nextState);
    store.state = nextState;
    store.currentPlayer = nextState.player;
    refreshSnapshots();
    emit();

    if (
        store.option !== GameMode.PVP &&
        store.winner === null &&
        store.currentPlayer !== store.humanPlayer
    ) {
        doAiMove();
    }
};

export const back = (): void => {
    if (store.history.length === 0) return;

    if (store.isAiTurn || store.option === GameMode.AIVAI) cancelAiWork();

    let result = gameBack(store.state, store.history);
    store.state = result.state;
    store.history = result.history;

    // Against an AI, keep unwinding until it is the human's turn again so one
    // Undo removes the AI reply together with the human move. When the last
    // move was the human's own (the AI never replied), a single step is enough.
    if (
        store.option !== GameMode.PVP &&
        store.option !== GameMode.AIVAI &&
        store.history.length > 0 &&
        store.state.player !== store.humanPlayer
    ) {
        result = gameBack(store.state, store.history);
        store.state = result.state;
        store.history = result.history;
    }

    store.currentPlayer = store.state.player;
    store.winner = checkGameWinner(store.state);
    store.isAiTurn = false;
    store.aiError = null;
    syncReviewWithHistory();
    refreshSnapshots();
    emit();

    // If the undo landed on the AI's turn (for example the AI opened the game
    // and its only move was undone), ask it to move instead of idling.
    if (store.winner === null && isAiToMove()) {
        startAiTurn(store.option === GameMode.AIVAI);
    }
};
