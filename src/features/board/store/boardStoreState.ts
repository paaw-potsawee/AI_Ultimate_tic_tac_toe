import type { CellPosition, RenderBoard } from "../types/board";
import type { GameResult, Move, Player } from "../types/game";
import type { ReviewSnapshot } from "../types/review";
import {
    getAvailableLocalBoards,
    getGameWinningLine,
    getUltimateBoard,
    toRenderBoard,
} from "../game";
import {
    GameMode,
    type AiModeValue,
    type GameModeValue,
} from "@/types/gameMode";

const initialState = getUltimateBoard();

export interface AiTurnStats {
    totalNodes: number;
    totalMs: number;
    turns: number;
}

const emptyStats = (): [AiTurnStats, AiTurnStats] => [
    { totalNodes: 0, totalMs: 0, turns: 0 },
    { totalNodes: 0, totalMs: 0, turns: 0 },
];

export const store = {
    state: initialState,
    currentPlayer: 0 as Player,
    winner: null as GameResult,
    history: [] as Move[],
    availableLocalBoards: [] as CellPosition[],
    option: GameMode.HEURISTIC_AI as GameModeValue,
    aiPlayers: [GameMode.HEURISTIC_AI, GameMode.HEURISTIC_AI] as [
        AiModeValue,
        AiModeValue,
    ],
    humanPlayer: 0 as Player,
    isAiTurn: false,
    boardSnapshot: toRenderBoard(initialState) as RenderBoard,
    gameWinningLineSnapshot: getGameWinningLine(initialState),
    aiStats: emptyStats() as [AiTurnStats, AiTurnStats],
    aiStatsSnapshot: emptyStats() as [AiTurnStats, AiTurnStats],
    // AI vs AI only: true while the match is held by the Pause button.
    isPaused: false,
    // Non-null while the user is looking back at an earlier move in the log.
    reviewSnapshot: null as ReviewSnapshot | null,
};

export const resetAiStats = (): void => {
    store.aiStats = emptyStats();
    store.aiStatsSnapshot = emptyStats();
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

export const refreshAiStatsSnapshot = (): void => {
    store.aiStatsSnapshot = [{ ...store.aiStats[0] }, { ...store.aiStats[1] }];
};

refreshSnapshots();
