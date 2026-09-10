import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getUltimateBoard } from "@/lib/game";
import type { WorkerRequest, WorkerResponse } from "@/types/aiWorker";
import { GameMode } from "@/types/gameMode";

const mocks = vi.hoisted(() => ({
    getAiMove: vi.fn(),
}));

vi.mock("@/lib/ai", () => ({
    getAiMove: mocks.getAiMove,
}));

describe("AI worker response protocol", () => {
    let messageHandler: (event: MessageEvent<WorkerRequest>) => void;
    let postMessageMock: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
        vi.resetModules();
        mocks.getAiMove.mockReset();
        postMessageMock = vi.fn();
        vi.stubGlobal("postMessage", postMessageMock);
        vi.stubGlobal(
            "addEventListener",
            vi.fn((type: string, handler: EventListener) => {
                if (type === "message") {
                    messageHandler =
                        handler as unknown as typeof messageHandler;
                }
            }),
        );
        vi.spyOn(console, "error").mockImplementation(() => undefined);

        await import("@/workers/aiWorker");
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("posts a discriminated success response", () => {
        const state = getUltimateBoard();
        mocks.getAiMove.mockReturnValue({ board: 4, cell: 4 });

        messageHandler({
            data: { state, option: GameMode.HEURISTIC_AI, epoch: 3 },
        } as MessageEvent<WorkerRequest>);

        expect(postMessageMock).toHaveBeenCalledWith(
            expect.objectContaining<WorkerResponse>({
                ok: true,
                board: 4,
                cell: 4,
                epoch: 3,
                durationMs: expect.any(Number) as number,
            }),
        );
    });

    it("posts a discriminated error response", () => {
        const state = getUltimateBoard();
        mocks.getAiMove.mockImplementation(() => {
            throw new Error("No available moves");
        });

        messageHandler({
            data: { state, option: GameMode.HEURISTIC_AI, epoch: 8 },
        } as MessageEvent<WorkerRequest>);

        expect(postMessageMock).toHaveBeenCalledWith(
            expect.objectContaining<WorkerResponse>({
                ok: false,
                error: "No available moves",
                epoch: 8,
                durationMs: expect.any(Number) as number,
            }),
        );
    });
});
