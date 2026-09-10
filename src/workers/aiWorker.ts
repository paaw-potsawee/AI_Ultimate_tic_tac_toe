import { getAiMove } from "@/lib/ai";
import type { WorkerRequest, WorkerResponse } from "@/types/aiWorker";

addEventListener("message", (event: MessageEvent<WorkerRequest>) => {
    const { state, option, epoch } = event.data;
    const start = performance.now();

    try {
        const move = getAiMove(state, option);
        const durationMs = performance.now() - start;

        const response: WorkerResponse = {
            ok: true,
            board: move.board,
            cell: move.cell,
            epoch,
            durationMs,
        };

        (postMessage as (message: WorkerResponse) => void)(response);
    } catch (err) {
        const response: WorkerResponse = {
            ok: false,
            error: err instanceof Error ? err.message : String(err),
            epoch,
            durationMs: performance.now() - start,
        };

        console.error("Worker error calculating AI move:", err);
        (postMessage as (message: WorkerResponse) => void)(response);
    }
});
