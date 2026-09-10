import { describe, expect, it } from "vitest";
import { getAvailableMoves, getUltimateBoard } from "@/lib/game";
import { evaluateHeuristic } from "@/lib/heuristicSearch";

describe("evaluateHeuristic", () => {
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
});
