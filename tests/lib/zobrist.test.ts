import { describe, expect, it } from "vitest";
import { getUltimateBoard } from "@/features/board";
import {
    getZobristHash,
    getZobristKey,
} from "@/features/ai/engine/shared/zobrist";

describe("Zobrist keys", () => {
    it("is deterministic and keeps the primary hash API compatible", () => {
        const first = getUltimateBoard();
        const second = getUltimateBoard();

        expect(getZobristKey(first)).toEqual(getZobristKey(second));
        expect(getZobristHash(first)).toBe(getZobristKey(first).primary);
    });

    it("includes the player, forced board, and placed pieces", () => {
        const initialKey = getZobristKey(getUltimateBoard());

        const changedPlayer = getUltimateBoard();
        changedPlayer.player = 1;

        const changedBoard = getUltimateBoard();
        changedBoard.nextBoard = 4;

        const changedPieces = getUltimateBoard();
        changedPieces.x[4] = 1 << 4;

        expect(getZobristKey(changedPlayer)).not.toEqual(initialKey);
        expect(getZobristKey(changedBoard)).not.toEqual(initialKey);
        expect(getZobristKey(changedPieces)).not.toEqual(initialKey);
    });
});
