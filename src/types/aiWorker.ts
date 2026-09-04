import type { GameState } from "@/types/game";
import type { GameModeValue } from "@/types/gameMode";

export interface WorkerRequest {
    state: GameState;
    option: GameModeValue;
    epoch: number;
}

export interface WorkerResponse {
    board: number;
    cell: number;
    epoch: number;
    durationMs: number;
}
