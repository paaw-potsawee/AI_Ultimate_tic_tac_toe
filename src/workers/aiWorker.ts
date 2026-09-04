import { getAiMove } from "@/lib/ai";
import type { WorkerRequest, WorkerResponse } from "@/types/aiWorker";

addEventListener("message", (event: MessageEvent<WorkerRequest>) => {
    const { state, option, epoch } = event.data;
    try {
        const start = performance.now();
        const move = getAiMove(state, option);
        const durationMs = performance.now() - start;

        const response: WorkerResponse = {
            board: move.board,
            cell: move.cell,
            epoch,
            durationMs,
        };

        (postMessage as (message: WorkerResponse) => void)(response);
    } catch (err) {
        console.error("Worker error calculating AI move:", err);
    }
});
