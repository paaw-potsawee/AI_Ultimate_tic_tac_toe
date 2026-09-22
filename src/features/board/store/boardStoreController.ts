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
import {
    emit,
    optionListeners,
    refreshSnapshots,
    store,
} from "./boardStoreState";

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
    emit();
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
        store.option === GameMode.AIVAI
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

    if (store.isAiTurn) {
        cancelAiWork();
        const result = gameBack(store.state, store.history);
        store.state = result.state;
        store.history = result.history;
    } else {
        if (store.option === GameMode.AIVAI) cancelAiWork();

        let result = gameBack(store.state, store.history);
        store.state = result.state;
        store.history = result.history;

        if (store.option !== GameMode.PVP && store.history.length > 0) {
            result = gameBack(store.state, store.history);
            store.state = result.state;
            store.history = result.history;
        }
    }

    store.currentPlayer = store.state.player;
    store.winner = checkGameWinner(store.state);
    store.isAiTurn = false;
    refreshSnapshots();
    emit();
};
