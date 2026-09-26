import type { ZobristKey } from "./zobrist";

export type TranspositionFlag = "EXACT" | "LOWER" | "UPPER";

export interface TranspositionEntry {
    value: number;
    flag: TranspositionFlag;
    bestMove: number | null;
    depth: number;
}

export interface TranspositionTable {
    get: (key: ZobristKey) => TranspositionEntry | undefined;
    set: (key: ZobristKey, entry: TranspositionEntry) => void;
}

export interface SearchContext {
    deadline: number;
    nodes: number;
    table: TranspositionTable;
}

export interface SearchResult {
    move: number | null;
    nodes: number;
}
