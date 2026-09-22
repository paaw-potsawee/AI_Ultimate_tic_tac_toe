import { TRANSPOSITION_TABLE_LIMIT } from "./constants";
import type { TranspositionEntry, TranspositionTable } from "./types";
import type { ZobristKey } from "./zobrist";

interface TranspositionSlot {
    verification: number;
    entry: TranspositionEntry;
}

export class BoundedTranspositionTable implements TranspositionTable {
    private readonly entries = new Map<number, TranspositionSlot>();
    private readonly capacity: number;

    constructor(capacity: number = TRANSPOSITION_TABLE_LIMIT) {
        this.capacity = capacity;
    }

    get size(): number {
        return this.entries.size;
    }

    get(key: ZobristKey): TranspositionEntry | undefined {
        const slot = this.entries.get(key.primary);

        if (!slot || slot.verification !== key.verification) {
            return undefined;
        }

        return slot.entry;
    }

    set(key: ZobristKey, entry: TranspositionEntry): void {
        const existing = this.entries.get(key.primary);

        if (existing) {
            if (entry.depth < existing.entry.depth) return;

            this.entries.set(key.primary, {
                verification: key.verification,
                entry,
            });
            return;
        }

        if (this.entries.size >= this.capacity) return;

        this.entries.set(key.primary, {
            verification: key.verification,
            entry,
        });
    }
}
