import { describe, expect, it } from "vitest";
import { BoundedTranspositionTable } from "@/features/ai/engine/shared/transpositionTable";
import type { TranspositionEntry } from "@/features/ai/engine/shared/types";
import type { ZobristKey } from "@/features/ai/engine/shared/zobrist";

const key = (primary: number, verification: number): ZobristKey => ({
    primary,
    verification,
});

const entry = (depth: number, value: number): TranspositionEntry => ({
    depth,
    value,
    flag: "EXACT",
    bestMove: null,
});

describe("BoundedTranspositionTable", () => {
    it("treats a primary-hash collision as a cache miss", () => {
        const table = new BoundedTranspositionTable(2);
        const firstKey = key(10, 100);
        const collidingKey = key(10, 200);

        table.set(firstKey, entry(2, 20));

        expect(table.get(collidingKey)).toBeUndefined();

        table.set(collidingKey, entry(3, 30));

        expect(table.get(firstKey)).toBeUndefined();
        expect(table.get(collidingKey)?.value).toBe(30);
    });

    it("never grows beyond its configured capacity", () => {
        const table = new BoundedTranspositionTable(2);

        table.set(key(1, 11), entry(1, 10));
        table.set(key(2, 22), entry(1, 20));
        table.set(key(3, 33), entry(1, 30));

        expect(table.size).toBe(2);
        expect(table.get(key(3, 33))).toBeUndefined();
    });

    it("keeps deeper entries and allows an equal or deeper replacement", () => {
        const table = new BoundedTranspositionTable(2);
        const stateKey = key(1, 11);

        table.set(stateKey, entry(5, 50));
        table.set(stateKey, entry(3, 30));
        expect(table.get(stateKey)?.value).toBe(50);

        table.set(stateKey, entry(5, 55));
        expect(table.get(stateKey)?.value).toBe(55);

        table.set(stateKey, entry(6, 60));
        expect(table.get(stateKey)?.value).toBe(60);
    });
});
