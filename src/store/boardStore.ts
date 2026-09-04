import { useSyncExternalStore } from "react";
import type { CellPosition } from "@/types/board";
import type { Move, Player, GameResult } from "@/types/game";
import {
    applyMove,
    checkGameWinner,
    getAvailableLocalBoards,
    getGameWinningLine,
    getUltimateBoard,
    isAvailableCell,
    toRenderBoard,
    back,
} from "@/lib/game";
import { GameMode, type GameModeValue } from "@/types/gameMode";
import type { WorkerRequest, WorkerResponse } from "@/types/aiWorker";

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

let aiWorker: Worker | null = null;
let aiEpoch = 0;
let aiDelayTimeout: ReturnType<typeof setTimeout> | null = null;
const AIVAI_DELAY_MS = 500;

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

const getWorker = () => {
    if (!aiWorker) {
        aiWorker = new Worker(
            new URL("../workers/aiWorker.ts", import.meta.url),
            { type: "module" },
        );
        aiWorker.onmessage = handleWorkerMessage;
        aiWorker.onerror = (err) => {
            console.error("AI worker error:", err);
            isAiTurn = false;
            emit();
        };
    }
    return aiWorker;
};

const handleWorkerMessage = (event: MessageEvent<WorkerResponse>) => {
    const { board, cell, epoch, durationMs } = event.data;

    // Discard stale moves if user undid, reset, or left the game
    if (epoch !== aiEpoch) {
        return;
    }

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

    // Trigger next AI move if necessary (e.g. AI vs AI, or player vs AI)
    if (
        option !== GameMode.PVP &&
        winner === null &&
        (option === GameMode.AIVAI || currentPlayer !== humanPlayer)
    ) {
        if (option === GameMode.AIVAI) {
            aiDelayTimeout = setTimeout(() => {
                if (epoch === aiEpoch) {
                    doAiMove();
                }
            }, AIVAI_DELAY_MS);
        } else {
            doAiMove();
        }
    }
};

const doAiMove = () => {
    if (winner !== null || option === GameMode.PVP) return;

    isAiTurn = true;
    emit();

    const request: WorkerRequest = {
        state,
        option,
        epoch: aiEpoch,
    };

    getWorker().postMessage(request);
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
        aiEpoch++;
        if (aiDelayTimeout) {
            clearTimeout(aiDelayTimeout);
            aiDelayTimeout = null;
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
        if (
            option === GameMode.AIVAI ||
            (option !== GameMode.PVP && currentPlayer !== humanPlayer)
        ) {
            if (option === GameMode.AIVAI) {
                const currentEpoch = aiEpoch;
                aiDelayTimeout = setTimeout(() => {
                    if (currentEpoch === aiEpoch) {
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

        // If AI is currently calculating, cancel it and undo human's last move
        if (isAiTurn) {
            aiEpoch++;
            if (aiDelayTimeout) {
                clearTimeout(aiDelayTimeout);
                aiDelayTimeout = null;
            }
            isAiTurn = false;

            const result = back(state, history);
            state = result.state;
            history = result.history;
            currentPlayer = state.player;
            winner = checkGameWinner(state);
            refreshAvailableBoards();
            emit();
            return;
        }

        if (aiDelayTimeout) {
            aiEpoch++;
            clearTimeout(aiDelayTimeout);
            aiDelayTimeout = null;
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
