/** @vitest-environment jsdom */

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { WorkerRequest, WorkerResponse } from "@/types/aiWorker";
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

    emitError(message: string) {
        this.onerror?.({ message } as ErrorEvent);
    }
}

const renderStore = async () => {
    const { useBoardStore, useGameConfigStore } =
        await import("@/store/boardStore");

    return renderHook(() => ({
        board: useBoardStore(),
        config: useGameConfigStore(),
    }));
};

const startWithAiAsX = async () => {
    const hook = await renderStore();
    act(() => hook.result.current.config.startGame(GameMode.HEURISTIC_AI, 1));
    return hook;
};

describe("BoardStore AI worker lifecycle", () => {
    beforeEach(() => {
        vi.resetModules();
        MockWorker.instances = [];
        vi.stubGlobal("Worker", MockWorker);
        vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("terminates active work on leave and ignores its stale response", async () => {
        const hook = await startWithAiAsX();
        const worker = MockWorker.instances[0];
        const request = worker.postMessage.mock.calls[0][0] as WorkerRequest;

        expect(hook.result.current.board.isAiTurn).toBe(true);

        act(() => hook.result.current.config.leaveGame());
        expect(worker.terminate).toHaveBeenCalledOnce();
        expect(hook.result.current.board.isAiTurn).toBe(false);

        act(() =>
            worker.emitMessage({
                ok: true,
                board: 4,
                cell: 4,
                epoch: request.epoch,
                durationMs: 10,
            }),
        );
        expect(hook.result.current.board.history).toHaveLength(0);
    });

    it("terminates the old worker and creates fresh work on reset", async () => {
        const hook = await startWithAiAsX();
        const oldWorker = MockWorker.instances[0];

        act(() => hook.result.current.board.clearBoard());

        expect(oldWorker.terminate).toHaveBeenCalledOnce();
        expect(MockWorker.instances).toHaveLength(2);
        expect(MockWorker.instances[1].postMessage).toHaveBeenCalledOnce();
        expect(hook.result.current.board.isAiTurn).toBe(true);
    });

    it("terminates active work when undoing the human move", async () => {
        const hook = await renderStore();
        act(() =>
            hook.result.current.config.startGame(GameMode.HEURISTIC_AI, 0),
        );
        act(() =>
            hook.result.current.board.handleCellClick({
                localRow: 1,
                localCol: 1,
                cellRow: 1,
                cellCol: 1,
            }),
        );

        const worker = MockWorker.instances[0];
        expect(hook.result.current.board.history).toHaveLength(1);
        expect(hook.result.current.board.isAiTurn).toBe(true);

        act(() => hook.result.current.board.back());

        expect(worker.terminate).toHaveBeenCalledOnce();
        expect(hook.result.current.board.history).toHaveLength(0);
        expect(hook.result.current.board.isAiTurn).toBe(false);
    });

    it("unlocks the UI when the worker reports an error", async () => {
        const hook = await startWithAiAsX();
        const worker = MockWorker.instances[0];
        const request = worker.postMessage.mock.calls[0][0] as WorkerRequest;

        act(() =>
            worker.emitMessage({
                ok: false,
                error: "No available moves",
                epoch: request.epoch,
                durationMs: 1,
            }),
        );

        expect(worker.terminate).toHaveBeenCalledOnce();
        expect(hook.result.current.board.isAiTurn).toBe(false);
        expect(console.error).toHaveBeenCalledWith(
            "AI failed to calculate a move:",
            "No available moves",
        );
    });

    it("cleans up after a native worker error", async () => {
        const hook = await startWithAiAsX();
        const worker = MockWorker.instances[0];

        act(() => worker.emitError("Worker crashed"));

        expect(worker.terminate).toHaveBeenCalledOnce();
        expect(hook.result.current.board.isAiTurn).toBe(false);
        expect(console.error).toHaveBeenCalledWith(
            "AI worker error:",
            expect.objectContaining({ message: "Worker crashed" }),
        );
    });
});
