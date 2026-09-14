import { useCallback, useEffect, useRef } from "react";
import type { WorkerRequest, WorkerResponse } from "../types/aiWorker";
import {
    registerAiWorker,
    notifyAiMoveResult,
    notifyAiError,
    notifyWorkerCrash,
} from "@/features/board";

/**
 * Manages the AI Web Worker lifecycle and wires it to the board store.
 *
 * Call this once at the application root (e.g. in App). The hook creates
 * a Worker on first use, routes its messages to the board store via the
 * registered callbacks, and terminates the Worker on unmount.
 *
 * The Worker is lazily created — it is only spawned when the first AI move
 * is actually requested, and a fresh one is created automatically after any
 * termination (error recovery or undo/reset).
 */
export const useAiWorker = (): void => {
    const workerRef = useRef<Worker | null>(null);

    const getOrCreateWorker = useCallback((): Worker => {
        if (!workerRef.current) {
            const w = new Worker(
                // Direct relative path — MUST NOT go through any barrel.
                new URL("../worker/aiWorker.ts", import.meta.url),
                { type: "module" },
            );

            w.onmessage = (event: MessageEvent<WorkerResponse>) => {
                if (!event.data.ok) {
                    notifyAiError(event.data.error, event.data.epoch);
                    return;
                }
                notifyAiMoveResult(
                    event.data.board,
                    event.data.cell,
                    event.data.durationMs,
                    event.data.epoch,
                );
            };

            w.onerror = () => {
                // Clear the ref before notifying so that any re-trigger inside
                // notifyWorkerCrash → cancelAiWork → _terminateWorker finds
                // the ref already null and skips a redundant terminate() call.
                workerRef.current = null;
                notifyWorkerCrash();
            };

            workerRef.current = w;
        }

        return workerRef.current;
    }, []);

    const triggerMove = useCallback(
        (request: WorkerRequest): void => {
            getOrCreateWorker().postMessage(request);
        },
        [getOrCreateWorker],
    );

    const cancel = useCallback((): void => {
        if (workerRef.current) {
            workerRef.current.terminate();
            workerRef.current = null;
        }
    }, []);

    // Register trigger and cancel with the board store so it can initiate
    // and abort AI moves without importing or touching React directly.
    // triggerMove and cancel are stable (empty-dep useCallback), so this
    // effect runs exactly once after mount.
    useEffect(() => {
        registerAiWorker(triggerMove, cancel);
    }, [triggerMove, cancel]);

    // Terminate the worker when the component tree unmounts.
    useEffect(() => () => cancel(), [cancel]);
};
