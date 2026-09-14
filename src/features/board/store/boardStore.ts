import { useSyncExternalStore } from "react";
import type { CellPosition } from "../types/board";
import type { Move, Player, GameResult } from "../types/game";
import {
    applyMove,
    checkGameWinner,
    getAvailableLocalBoards,
    getGameWinningLine,
    getUltimateBoard,
    isAvailableCell,
    toRenderBoard,
    back,
} from "../game";
import { GameMode, type GameModeValue } from "@/types/gameMode";
import type { WorkerRequest } from "@/features/ai";

// ---------------------------------------------------------------------------
// Module-level game state
// ---------------------------------------------------------------------------

let state = getUltimateBoard();
let currentPlayer: Player = 0;
let winner: GameResult = null;
let history: Move[] = [];
let availableLocalBoards: CellPosition[] = getAvailableLocalBoards(
    state,
    history,
);
let option: GameModeValue = 1;
let boardSnapshot = toRenderBoard(state);
let gameWinningLineSnapshot = getGameWinningLine(state);
let humanPlayer: Player = 0;
let isAiTurn = false;

let aiEpoch = 0;
let aiDelayTimeout: ReturnType<typeof setTimeout> | null = null;
const AIVAI_DELAY_MS = 500;

// Registered by the useAiWorker hook — null until the hook mounts.
let _triggerMove: ((request: WorkerRequest) => void) | null = null;
let _terminateWorker: (() => void) | null = null;

// ---------------------------------------------------------------------------
// Internal pub/sub
// ---------------------------------------------------------------------------

const listeners: Set<() => void> = new Set();
const optionListeners: Set<() => void> = new Set();

const emit = () => {
    listeners.forEach((cb) => cb());
};

const refreshAvailableBoards = () => {
    availableLocalBoards = getAvailableLocalBoards(state, history);
    boardSnapshot = toRenderBoard(state);
    gameWinningLineSnapshot = getGameWinningLine(state);
};

// ---------------------------------------------------------------------------
// Internal AI orchestration helpers
// ---------------------------------------------------------------------------

const cancelAiWork = () => {
    aiEpoch++;

    if (aiDelayTimeout !== null) {
        clearTimeout(aiDelayTimeout);
        aiDelayTimeout = null;
    }

    _terminateWorker?.();
    isAiTurn = false;
};

const doAiMove = () => {
    if (winner !== null || option === GameMode.PVP || _triggerMove === null)
        return;

    isAiTurn = true;
    emit();

    _triggerMove({ state, option, epoch: aiEpoch });
};

// ---------------------------------------------------------------------------
// AI worker integration — exported for use by useAiWorker hook ONLY
// ---------------------------------------------------------------------------

export const registerAiWorker = (
    trigger: (request: WorkerRequest) => void,
    terminate: () => void,
): void => {
    _triggerMove = trigger;
    _terminateWorker = terminate;
};

export const notifyAiMoveResult = (
    board: number,
    cell: number,
    durationMs: number,
    epoch: number,
): void => {
    // Discard stale responses (user undid, reset, or left the game).
    if (epoch !== aiEpoch) return;

    console.log(`AI move took ${durationMs.toFixed(1)} milliseconds`);

    const nextState = applyMove(state, currentPlayer, board, cell);

    history = [
        ...history,
        {
            player: currentPlayer,
            localRow: Math.floor(board / 3),
            localCol: board % 3,
            cellRow: Math.floor(cell / 3),
            cellCol: cell % 3,
            board,
            cell,
        },
    ];

    winner = checkGameWinner(nextState);
    state = nextState;
    currentPlayer = nextState.player;
    isAiTurn = false;
    refreshAvailableBoards();
    emit();

    // Trigger the next AI move if still needed (AI vs AI, or AI's turn again).
    if (
        option !== GameMode.PVP &&
        winner === null &&
        (option === GameMode.AIVAI || currentPlayer !== humanPlayer)
    ) {
        if (option === GameMode.AIVAI) {
            const currentEpoch = aiEpoch;
            aiDelayTimeout = setTimeout(() => {
                if (currentEpoch === aiEpoch) {
                    aiDelayTimeout = null;
                    doAiMove();
                }
            }, AIVAI_DELAY_MS);
        } else {
            doAiMove();
        }
    }
};

/**
 * Called by useAiWorker when the Worker posts an error response (ok: false).
 * The epoch check ensures stale error responses are silently discarded.
 */
export const notifyAiError = (error: string, epoch: number): void => {
    if (epoch !== aiEpoch) return;
    console.error("AI failed to calculate a move:", error);
    cancelAiWork();
    emit();
};

/**
 * Called by useAiWorker when the Worker crashes (onerror event).
 * No epoch check — a crash always resets AI state.
 */
export const notifyWorkerCrash = (): void => {
    console.error("AI worker crashed unexpectedly");
    cancelAiWork();
    emit();
};

// ---------------------------------------------------------------------------
// BoardStore object (board state + game lifecycle)
// ---------------------------------------------------------------------------

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
    getGameWinningLine() {
        return gameWinningLineSnapshot;
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
        cancelAiWork();
        emit();
    },
    clearBoard() {
        cancelAiWork();
        state = getUltimateBoard();
        currentPlayer = 0;
        winner = null;
        history = [];
        isAiTurn = false;
        refreshAvailableBoards();
        emit();
        if (
            option === GameMode.AIVAI ||
            (option !== GameMode.PVP && currentPlayer !== humanPlayer)
        ) {
            if (option === GameMode.AIVAI) {
                const currentEpoch = aiEpoch;
                aiDelayTimeout = setTimeout(() => {
                    if (currentEpoch === aiEpoch) {
                        aiDelayTimeout = null;
                        doAiMove();
                    }
                }, AIVAI_DELAY_MS);
            } else {
                doAiMove();
            }
        }
    },
    handleCellClick({ localRow, localCol, cellRow, cellCol }: CellPosition) {
        if (winner !== null || isAiTurn || option === GameMode.AIVAI) {
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
        if (history.length === 0) {
            return;
        }

        if (isAiTurn) {
            cancelAiWork();

            const result = back(state, history);
            state = result.state;
            history = result.history;
            currentPlayer = state.player;
            winner = checkGameWinner(state);
            refreshAvailableBoards();
            emit();
            return;
        }

        if (aiDelayTimeout !== null) {
            cancelAiWork();
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

// ---------------------------------------------------------------------------
// React hooks (useSyncExternalStore wrappers)
// ---------------------------------------------------------------------------

export const useBoardStore = () => {
    const board = useSyncExternalStore(
        BoardStore.subscribe,
        BoardStore.getBoard,
    );
    const isAiTurn = useSyncExternalStore(
        BoardStore.subscribe,
        BoardStore.getIsAiTurn,
    );
    const gameWinningLine = useSyncExternalStore(
        BoardStore.subscribe,
        BoardStore.getGameWinningLine,
    );

    return {
        board,
        clearBoard: BoardStore.clearBoard,
        handleCellClick: BoardStore.handleCellClick,
        back: BoardStore.back,
        currentPlayer: currentPlayer === 0 ? "X" : "O",
        winner,
        gameWinningLine,
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
