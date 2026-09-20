import type { CellPosition, RenderBoard } from "../types/board";
import type { GameResult, Move, Player } from "../types/game";
import {
    getAvailableLocalBoards,
    getGameWinningLine,
    getUltimateBoard,
    toRenderBoard,
} from "../game";
import { GameMode, type GameModeValue } from "@/types/gameMode";

const initialState = getUltimateBoard();

export const store = {
    state: initialState,
    currentPlayer: 0 as Player,
    winner: null as GameResult,
    history: [] as Move[],
    availableLocalBoards: [] as CellPosition[],
    option: GameMode.HEURISTIC_AI as GameModeValue,
    humanPlayer: 0 as Player,
    isAiTurn: false,
    boardSnapshot: toRenderBoard(initialState) as RenderBoard,
    gameWinningLineSnapshot: getGameWinningLine(initialState),
};

export const listeners: Set<() => void> = new Set();
export const optionListeners: Set<() => void> = new Set();

export const emit = (): void => {
    listeners.forEach((listener) => listener());
};

export const refreshSnapshots = (): void => {
    store.availableLocalBoards = getAvailableLocalBoards(
        store.state,
        store.history,
    );
    store.boardSnapshot = toRenderBoard(store.state);
    store.gameWinningLineSnapshot = getGameWinningLine(store.state);
};

refreshSnapshots();
