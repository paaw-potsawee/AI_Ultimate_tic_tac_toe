import type { GameState } from "@/features/board/types/game";
import type { AiModeValue } from "@/types/gameMode";

export interface WorkerRequest {
    state: GameState;
    algorithm: AiModeValue;
    epoch: number;
}

export interface WorkerSuccessResponse {
    ok: true;
    board: number;
    cell: number;
    epoch: number;
    durationMs: number;
}

export interface WorkerErrorResponse {
    ok: false;
    error: string;
    epoch: number;
    durationMs: number;
}

export type WorkerResponse = WorkerSuccessResponse | WorkerErrorResponse;
