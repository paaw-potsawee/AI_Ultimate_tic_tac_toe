import type { WorkerRequest } from "../../ai/types/aiWorker";
import { GameMode, type AiModeValue } from "@/types/gameMode";
import { applyMove, checkGameWinner } from "../game";
import { emit, refreshSnapshots, store } from "./boardStoreState";

const AIVAI_DELAY_MS = 500;
let aiEpoch = 0;
let aiDelayTimeout: ReturnType<typeof setTimeout> | null = null;
let triggerMove: ((request: WorkerRequest) => void) | null = null;
let terminateWorker: (() => void) | null = null;

export const registerAiWorker = (
    trigger: (request: WorkerRequest) => void,
    terminate: () => void,
): void => {
    triggerMove = trigger;
    terminateWorker = terminate;
};

export const cancelAiWork = (): void => {
    aiEpoch += 1;

    if (aiDelayTimeout !== null) {
        clearTimeout(aiDelayTimeout);
        aiDelayTimeout = null;
    }

    terminateWorker?.();
    store.isAiTurn = false;
};

export const doAiMove = (): void => {
    if (
        store.winner !== null ||
        store.option === GameMode.PVP ||
        triggerMove === null
    ) {
        return;
    }

    const algorithm: AiModeValue =
        store.option === GameMode.AIVAI
            ? store.aiPlayers[store.currentPlayer]
            : store.option;

    store.isAiTurn = true;
    emit();
    triggerMove({
        state: store.state,
        algorithm,
        epoch: aiEpoch,
    });
};

export const startAiTurn = (delayForAiVsAi = false): void => {
    if (
        store.option === GameMode.PVP ||
        (store.option !== GameMode.AIVAI &&
            store.currentPlayer === store.humanPlayer)
    ) {
        return;
    }

    if (delayForAiVsAi && store.option === GameMode.AIVAI) {
        const currentEpoch = aiEpoch;
        aiDelayTimeout = setTimeout(() => {
            if (currentEpoch !== aiEpoch) return;
            aiDelayTimeout = null;
            doAiMove();
        }, AIVAI_DELAY_MS);
        return;
    }

    doAiMove();
};

export const notifyAiMoveResult = (
    board: number,
    cell: number,
    durationMs: number,
    epoch: number,
): void => {
    if (epoch !== aiEpoch) return;

    console.log(`AI move took ${durationMs.toFixed(1)} milliseconds`);

    const nextState = applyMove(store.state, board, cell);

    store.history = [
        ...store.history,
        {
            player: store.currentPlayer,
            localRow: Math.floor(board / 3),
            localCol: board % 3,
            cellRow: Math.floor(cell / 3),
            cellCol: cell % 3,
            board,
            cell,
        },
    ];
    store.winner = checkGameWinner(nextState);
    store.state = nextState;
    store.currentPlayer = nextState.player;
    store.isAiTurn = false;
    refreshSnapshots();
    emit();

    if (
        store.option !== GameMode.PVP &&
        store.winner === null &&
        (store.option === GameMode.AIVAI ||
            store.currentPlayer !== store.humanPlayer)
    ) {
        startAiTurn(store.option === GameMode.AIVAI);
    }
};

export const notifyAiError = (error: string, epoch: number): void => {
    if (epoch !== aiEpoch) return;
    console.error("AI failed to calculate a move:", error);
    cancelAiWork();
    emit();
};

export const notifyWorkerCrash = (): void => {
    console.error("AI worker crashed unexpectedly");
    cancelAiWork();
    emit();
};
