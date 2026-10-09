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

    emitError(message: string) {
        this.onerror?.({ message } as ErrorEvent);
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

const centre = { localRow: 1, localCol: 1, cellRow: 1, cellCol: 1 };
const centreTopLeft = { localRow: 1, localCol: 1, cellRow: 0, cellCol: 0 };

const aiReply = (worker: MockWorker, board: number, cell: number) =>
    worker.emitMessage({
        ok: true,
        board,
        cell,
        epoch: lastRequest(worker).epoch,
        durationMs: 5,
        nodes: 0,
    });

const aiFailure = (worker: MockWorker) =>
    worker.emitMessage({
        ok: false,
        error: "No available moves",
        epoch: lastRequest(worker).epoch,
        durationMs: 5,
    });

describe("BoardStore undo against an AI", () => {
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

    it("asks the AI to open again when its only move is undone", async () => {
        const hook = await renderStore();
        // Human plays O, so the AI (X) opens the game.
        act(() =>
            hook.result.current.config.startGame(GameMode.HEURISTIC_AI, 1),
        );
        const worker = MockWorker.instances[0];
        act(() => aiReply(worker, 4, 4));

        expect(hook.result.current.board.history).toHaveLength(1);
        expect(hook.result.current.board.currentPlayer).toBe("O");
        expect(hook.result.current.board.isAiTurn).toBe(false);

        act(() => hook.result.current.board.back());

        expect(hook.result.current.board.history).toHaveLength(0);
        expect(hook.result.current.board.currentPlayer).toBe("X");
        // The AI is immediately asked to move instead of leaving the board idle.
        expect(hook.result.current.board.isAiTurn).toBe(true);
        expect(worker.postMessage).toHaveBeenCalledTimes(2);
    });

    it("takes back the AI reply together with the human move", async () => {
        const hook = await renderStore();
        act(() =>
            hook.result.current.config.startGame(GameMode.HEURISTIC_AI, 0),
        );
        act(() => hook.result.current.board.handleCellClick(centre));
        const worker = MockWorker.instances[0];
        act(() => aiReply(worker, 4, 0));

        expect(hook.result.current.board.history).toHaveLength(2);
        expect(hook.result.current.board.currentPlayer).toBe("X");

        act(() => hook.result.current.board.back());

        expect(hook.result.current.board.history).toHaveLength(0);
        expect(hook.result.current.board.currentPlayer).toBe("X");
        expect(hook.result.current.board.isAiTurn).toBe(false);
        expect(worker.postMessage).toHaveBeenCalledOnce();
    });

    it("removes only the human move when the AI never replied", async () => {
        const hook = await renderStore();
        act(() =>
            hook.result.current.config.startGame(GameMode.HEURISTIC_AI, 0),
        );
        act(() => hook.result.current.board.handleCellClick(centre));
        const worker = MockWorker.instances[0];
        act(() => aiFailure(worker));

        expect(hook.result.current.board.history).toHaveLength(1);
        expect(hook.result.current.board.currentPlayer).toBe("O");
        expect(hook.result.current.board.aiError).toBe("No available moves");

        act(() => hook.result.current.board.back());

        expect(hook.result.current.board.history).toHaveLength(0);
        expect(hook.result.current.board.currentPlayer).toBe("X");
        expect(hook.result.current.board.aiError).toBeNull();
        expect(hook.result.current.board.isAiTurn).toBe(false);
        expect(MockWorker.instances).toHaveLength(1);
    });
});

describe("BoardStore turn ownership and AI failures", () => {
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

    it("never lets the human play the AI side after a failure", async () => {
        const hook = await renderStore();
        act(() =>
            hook.result.current.config.startGame(GameMode.HEURISTIC_AI, 0),
        );
        act(() => hook.result.current.board.handleCellClick(centre));
        act(() => aiFailure(MockWorker.instances[0]));

        expect(hook.result.current.board.isAiTurn).toBe(false);
        expect(hook.result.current.board.canHumanMove).toBe(false);

        act(() => hook.result.current.board.handleCellClick(centreTopLeft));

        expect(hook.result.current.board.history).toHaveLength(1);
        expect(hook.result.current.board.currentPlayer).toBe("O");
    });

    it("blocks the human before the AI has opened the game", async () => {
        const hook = await renderStore();
        act(() =>
            hook.result.current.config.startGame(GameMode.HEURISTIC_AI, 1),
        );

        act(() => hook.result.current.board.handleCellClick(centre));

        expect(hook.result.current.board.history).toHaveLength(0);
        expect(hook.result.current.board.canHumanMove).toBe(false);
    });

    it("retries with a fresh worker and clears the error on success", async () => {
        const hook = await renderStore();
        act(() =>
            hook.result.current.config.startGame(GameMode.HEURISTIC_AI, 0),
        );
        act(() => hook.result.current.board.handleCellClick(centre));
        act(() => aiFailure(MockWorker.instances[0]));
        expect(hook.result.current.board.aiError).toBe("No available moves");

        act(() => hook.result.current.board.retryAiMove());

        expect(hook.result.current.board.aiError).toBeNull();
        expect(hook.result.current.board.isAiTurn).toBe(true);
        expect(MockWorker.instances).toHaveLength(2);

        const retryWorker = MockWorker.instances[1];
        expect(retryWorker.postMessage).toHaveBeenCalledOnce();
        act(() => aiReply(retryWorker, 4, 0));

        expect(hook.result.current.board.history).toHaveLength(2);
        expect(hook.result.current.board.currentPlayer).toBe("X");
        expect(hook.result.current.board.canHumanMove).toBe(true);
    });

    it("ignores retry requests when it is the human's turn", async () => {
        const hook = await renderStore();
        act(() =>
            hook.result.current.config.startGame(GameMode.HEURISTIC_AI, 0),
        );

        act(() => hook.result.current.board.retryAiMove());

        expect(MockWorker.instances).toHaveLength(0);
        expect(hook.result.current.board.isAiTurn).toBe(false);
    });

    it("surfaces a worker crash and clears it on reset or leave", async () => {
        let hook = await renderStore();
        act(() =>
            hook.result.current.config.startGame(GameMode.HEURISTIC_AI, 1),
        );
        act(() => MockWorker.instances[0].emitError("boom"));

        expect(hook.result.current.board.aiError).toBe(
            "AI worker crashed unexpectedly",
        );

        act(() => hook.result.current.board.clearBoard());
        expect(hook.result.current.board.aiError).toBeNull();

        act(() => aiFailure(MockWorker.instances[1]));
        expect(hook.result.current.board.aiError).toBe("No available moves");

        act(() => hook.result.current.config.leaveGame());
        expect(hook.result.current.board.aiError).toBeNull();

        hook = await renderStore();
        expect(hook.result.current.board.aiError).toBeNull();
    });
});
