import type { GameState } from "@/features/board/types/game";

export interface OrderedMove {
    move: number;
    state: GameState;
    priority: number;
}

export interface SearchResult {
    move: number;
    value: number;
}
