import { afterEach, describe, expect, it, vi } from "vitest";
import { getAvailableMoves, getUltimateBoard } from "@/features/board";
import { evaluateHeuristic } from "@/features/ai/engine/heuristicSearch";

describe("evaluateHeuristic", () => {
    afterEach(() => vi.restoreAllMocks());

    it.each([
        { player: 0 as const, wonKey: "wonX" as const, boardKey: "x" as const },
        { player: 1 as const, wonKey: "wonO" as const, boardKey: "o" as const },
    ])("takes an immediate macro win for player $player", (testCase) => {
        const state = getUltimateBoard();
        state.player = testCase.player;
        state.nextBoard = 2;
        state[testCase.wonKey] = 0b000000011;
        state[testCase.boardKey][2] = 0b000000011;

        expect(evaluateHeuristic(state)).toBe(20);
    });

    it("returns the encoded move when only one legal move remains", () => {
        const state = getUltimateBoard();
        state.nextBoard = 0;
        state.x[0] = 0b010001101;
        state.o[0] = 0b001110010;

        expect(evaluateHeuristic(state)).toBe(8);
    });

    it("returns null for won and drawn terminal states", () => {
        const wonState = getUltimateBoard();
        wonState.wonX = 0b000000111;
        expect(evaluateHeuristic(wonState)).toBeNull();

        const drawnState = getUltimateBoard();
        drawnState.x.fill(0b110001101);
        drawnState.o.fill(0b001110010);
        expect(evaluateHeuristic(drawnState)).toBeNull();
    });

    it(
        "returns a legal opening move within the search time allowance",
        { timeout: 5_000 },
        () => {
            const state = getUltimateBoard();
            const legalMoves = getAvailableMoves(state);
            const start = performance.now();
            const move = evaluateHeuristic(state);
            const durationMs = performance.now() - start;

            expect(move).not.toBeNull();
            expect(legalMoves).toContain(move);
            expect(durationMs).toBeLessThan(2_000);
        },
    );

    it(
        "avoids sending the opponent to an immediate macro win",
        { timeout: 5_000 },
        () => {
            const state = getUltimateBoard();
            state.player = 0;
            state.nextBoard = 3;
            state.wonO = (1 << 1) | (1 << 7);
            state.o[1] = 0b000000111;
            state.o[7] = 0b000000111;
            state.o[4] = 0b000000011;

            const move = evaluateHeuristic(state);

            expect(move).not.toBeNull();
            expect([1, 4, 7]).not.toContain((move as number) % 9);
        },
    );

    it("returns its legal fallback when the deadline is already exhausted", () => {
        let callCount = 0;
        vi.spyOn(performance, "now").mockImplementation(() =>
            callCount++ === 0 ? 0 : 901,
        );
        const state = getUltimateBoard();
        const legalMoves = getAvailableMoves(state);

        const move = evaluateHeuristic(state);

        expect(legalMoves).toContain(move);
    });
});
