/** @vitest-environment jsdom */

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { WorkerRequest, WorkerResponse } from "@/features/ai";
import { GameMode } from "@/types/gameMode";

class MockWorker {
    static instances: MockWorker[] = [];

    onmessage: ((event: MessageEvent<WorkerResponse>) => void) | null = null;
    onerror: ((event: ErrorEvent) => void) | null = null;
    postMessage = vi.fn();
    terminate = vi.fn();

    constructor() {
        MockWorker.instances.push(this);
    }

    emitMessage(data: WorkerResponse) {
        this.onmessage?.({ data } as MessageEvent<WorkerResponse>);
    }
}

const renderStore = async () => {
    const { useBoardStore, useGameConfigStore } =
        await import("@/features/board");
    const { useAiWorker } = await import("@/features/ai");

    return renderHook(() => ({
        board: useBoardStore(),
        config: useGameConfigStore(),
        _ai: useAiWorker(),
    }));
};

const lastRequest = (worker: MockWorker): WorkerRequest =>
    worker.postMessage.mock.calls.at(-1)?.[0] as WorkerRequest;

describe("BoardStore move review", () => {
    beforeEach(() => {
        vi.resetModules();
        MockWorker.instances = [];
        vi.stubGlobal("Worker", MockWorker);
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    const playThreeMoves = async () => {
        const hook = await renderStore();
        act(() => hook.result.current.config.startGame(GameMode.PVP, 0));

        // X: centre board, centre cell -> O is sent to the centre board.
        act(() =>
            hook.result.current.board.handleCellClick({
                localRow: 1,
                localCol: 1,
                cellRow: 1,
                cellCol: 1,
            }),
        );
        // O: centre board, top-left cell -> X is sent to the top-left board.
        act(() =>
            hook.result.current.board.handleCellClick({
                localRow: 1,
                localCol: 1,
                cellRow: 0,
                cellCol: 0,
            }),
        );
        // X: top-left board, bottom-right cell.
        act(() =>
            hook.result.current.board.handleCellClick({
                localRow: 0,
                localCol: 0,
                cellRow: 2,
                cellCol: 2,
            }),
        );

        expect(hook.result.current.board.history).toHaveLength(3);
        return hook;
    };

    it("rebuilds the position after the chosen move without touching the live game", async () => {
        const hook = await playThreeMoves();

        act(() => hook.result.current.board.reviewMove(0));

        const review = hook.result.current.board.review;
        expect(review).not.toBeNull();
        expect(review?.moveNumber).toBe(1);
        expect(review?.move.player).toBe(0);
        expect(review?.board[1][1].board[1][1]).toBe("X");
        expect(review?.board[1][1].board[0][0]).toBeNull();
        expect(review?.board[0][0].board[2][2]).toBeNull();
        expect(review?.winner).toBeNull();
        // After move 1 (centre cell) the opponent had to play the centre board.
        expect(review?.availableLocalBoards).toEqual([
            { localRow: 1, localCol: 1, cellRow: 0, cellCol: 0 },
        ]);

        // The live board still shows every move.
        const live = hook.result.current.board;
        expect(live.board[1][1].board[0][0]).toBe("O");
        expect(live.board[0][0].board[2][2]).toBe("X");
        expect(live.history).toHaveLength(3);
        expect(live.currentPlayer).toBe("O");
    });

    it("ignores cell clicks while a past move is being viewed", async () => {
        const hook = await playThreeMoves();

        act(() => hook.result.current.board.reviewMove(1));
        act(() =>
            hook.result.current.board.handleCellClick({
                localRow: 2,
                localCol: 2,
                cellRow: 0,
                cellCol: 0,
            }),
        );

        expect(hook.result.current.board.history).toHaveLength(3);

        act(() => hook.result.current.board.exitReview());
        expect(hook.result.current.board.review).toBeNull();

        act(() =>
            hook.result.current.board.handleCellClick({
                localRow: 2,
                localCol: 2,
                cellRow: 0,
                cellCol: 0,
            }),
        );
        expect(hook.result.current.board.history).toHaveLength(4);
    });

    it("rejects out-of-range move indexes", async () => {
        const hook = await playThreeMoves();

        act(() => hook.result.current.board.reviewMove(3));
        expect(hook.result.current.board.review).toBeNull();

        act(() => hook.result.current.board.reviewMove(-1));
        expect(hook.result.current.board.review).toBeNull();
    });

    it("drops the review when undo removes the viewed move but keeps earlier ones", async () => {
        const hook = await playThreeMoves();

        act(() => hook.result.current.board.reviewMove(2));
        act(() => hook.result.current.board.back());

        expect(hook.result.current.board.history).toHaveLength(2);
        expect(hook.result.current.board.review).toBeNull();

        act(() => hook.result.current.board.reviewMove(0));
        act(() => hook.result.current.board.back());

        expect(hook.result.current.board.history).toHaveLength(1);
        expect(hook.result.current.board.review?.moveIndex).toBe(0);
    });

    it("clears the review on reset and when leaving the game", async () => {
        let hook = await playThreeMoves();

        act(() => hook.result.current.board.reviewMove(1));
        act(() => hook.result.current.board.clearBoard());
        expect(hook.result.current.board.review).toBeNull();
        expect(hook.result.current.board.history).toHaveLength(0);

        hook = await playThreeMoves();
        act(() => hook.result.current.board.reviewMove(1));
        act(() => hook.result.current.config.leaveGame());
        expect(hook.result.current.board.review).toBeNull();
    });
});

describe("BoardStore AI vs AI pause", () => {
    beforeEach(() => {
        vi.resetModules();
        MockWorker.instances = [];
        vi.stubGlobal("Worker", MockWorker);
        vi.useFakeTimers();
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    const startAiVsAi = async () => {
        const hook = await renderStore();
        act(() =>
            hook.result.current.config.startGame(GameMode.AIVAI, 0, [
                GameMode.HEURISTIC_AI,
                GameMode.BLIND_DFS_AI,
            ]),
        );
        return hook;
    };

    it("cancels the scheduled first move when paused during the start delay", async () => {
        const hook = await startAiVsAi();

        act(() => hook.result.current.board.togglePause());
        expect(hook.result.current.board.isPaused).toBe(true);

        act(() => vi.advanceTimersByTime(2000));
        expect(MockWorker.instances).toHaveLength(0);
        expect(hook.result.current.board.isAiTurn).toBe(false);

        act(() => hook.result.current.board.togglePause());
        expect(hook.result.current.board.isPaused).toBe(false);
        expect(MockWorker.instances).toHaveLength(1);
        expect(MockWorker.instances[0].postMessage).toHaveBeenCalledOnce();
        expect(hook.result.current.board.isAiTurn).toBe(true);
    });

    it("stops an in-flight search, ignores its stale result and resumes cleanly", async () => {
        const hook = await startAiVsAi();
        act(() => vi.advanceTimersByTime(500));

        const worker = MockWorker.instances[0];
        const staleRequest = lastRequest(worker);
        expect(hook.result.current.board.isAiTurn).toBe(true);

        act(() => hook.result.current.board.togglePause());
        expect(worker.terminate).toHaveBeenCalledOnce();
        expect(hook.result.current.board.isPaused).toBe(true);
        expect(hook.result.current.board.isAiTurn).toBe(false);

        act(() =>
            worker.emitMessage({
                ok: true,
                board: 4,
                cell: 4,
                epoch: staleRequest.epoch,
                durationMs: 10,
                nodes: 0,
            }),
        );
        expect(hook.result.current.board.history).toHaveLength(0);

        act(() => hook.result.current.board.togglePause());
        expect(hook.result.current.board.isPaused).toBe(false);
        expect(MockWorker.instances).toHaveLength(2);

        const resumedWorker = MockWorker.instances[1];
        const request = lastRequest(resumedWorker);
        expect(request.algorithm).toBe(GameMode.HEURISTIC_AI);
        expect(request.epoch).not.toBe(staleRequest.epoch);

        act(() =>
            resumedWorker.emitMessage({
                ok: true,
                board: 4,
                cell: 4,
                epoch: request.epoch,
                durationMs: 10,
                nodes: 0,
            }),
        );
        expect(hook.result.current.board.history).toHaveLength(1);

        act(() => vi.advanceTimersByTime(500));
        expect(lastRequest(resumedWorker).algorithm).toBe(
            GameMode.BLIND_DFS_AI,
        );
    });

    it("does nothing outside AI vs AI mode", async () => {
        const hook = await renderStore();
        act(() =>
            hook.result.current.config.startGame(GameMode.HEURISTIC_AI, 1),
        );
        const worker = MockWorker.instances[0];
        expect(hook.result.current.board.isAiTurn).toBe(true);

        act(() => hook.result.current.board.togglePause());

        expect(hook.result.current.board.isPaused).toBe(false);
        expect(hook.result.current.board.isAiTurn).toBe(true);
        expect(worker.terminate).not.toHaveBeenCalled();
    });

    it("resets the pause when the board is cleared", async () => {
        const hook = await startAiVsAi();

        act(() => hook.result.current.board.togglePause());
        expect(hook.result.current.board.isPaused).toBe(true);

        act(() => hook.result.current.board.clearBoard());
        expect(hook.result.current.board.isPaused).toBe(false);

        act(() => vi.advanceTimersByTime(500));
        expect(MockWorker.instances).toHaveLength(1);
        expect(MockWorker.instances[0].postMessage).toHaveBeenCalledOnce();
    });
});
