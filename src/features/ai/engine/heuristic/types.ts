import type { GameState } from "@/features/board/types/game";

export type TranspositionFlag = "EXACT" | "LOWER" | "UPPER";

export interface TranspositionEntry {
    value: number;
    flag: TranspositionFlag;
    bestMove: number | null;
    depth: number;
}

export interface SearchContext {
    deadline: number;
    nodes: number;
    table: Map<number, TranspositionEntry>;
}

export interface OrderedMove {
    move: number;
    state: GameState;
    priority: number;
}

export interface SearchResult {
    move: number;
    value: number;
}
