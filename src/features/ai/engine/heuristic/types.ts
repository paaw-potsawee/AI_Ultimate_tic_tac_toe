import type { GameState } from "@/features/board/types/game";

export interface OrderedMove {
    move: number;
    state: GameState;
    priority: number;
}

export interface DepthSearchResult {
    move: number;
    value: number;
}
