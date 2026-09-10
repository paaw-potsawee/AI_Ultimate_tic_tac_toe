import type { GameState } from "@/types/game";
import type { GameModeValue } from "@/types/gameMode";

export interface WorkerRequest {
    state: GameState;
    option: GameModeValue;
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
