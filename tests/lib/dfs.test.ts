import { describe, expect, it } from "vitest";
import { getUltimateBoard } from "@/features/board";
import { evaluateDFS } from "@/features/ai/engine/dfs";

describe("evaluateDFS", () => {
    it("finds a 2-move forced win for X (requires seeing the terminal node)", () => {
        const state = getUltimateBoard();
        state.player = 0;
        state.nextBoard = 2;
        state.x[2] = 0b000000011;
        state.wonX = 0b000000011;

        // needs depth ≥ 2 to see: X plays cell 1 → X plays cell 2 → WIN_SCORE
        const move = evaluateDFS(state, 4);
        expect(move).toBe(20);
    });

    it.each([
        { player: 0 as const, boardKey: "x" as const, oppKey: "o" as const },
        { player: 1 as const, boardKey: "o" as const, oppKey: "x" as const },
    ])("finds an immediate winning move for Player $player", (testCase) => {
        const state = getUltimateBoard();
        state.player = testCase.player;
        state.nextBoard = 0;
        state[testCase.boardKey][0] = 0b000000011;
        state[testCase.oppKey][0] = 0b000000000;

        expect(evaluateDFS(state, 2)).toBe(2);
    });

    it.each([
        { player: 0 as const, boardKey: "x" as const, oppKey: "o" as const },
        { player: 1 as const, boardKey: "o" as const, oppKey: "x" as const },
    ])("blocks an opponent's winning line for Player $player", (testCase) => {
        const state = getUltimateBoard();
        state.player = testCase.player;
        state.nextBoard = 0;
        state[testCase.oppKey][0] = 0b000000011;
        state[testCase.boardKey][0] = 0b000000000;

        expect(evaluateDFS(state, 2)).toBe(2);
    });

    it.each([
        { player: 0 as const, wonKey: "wonX" as const, boardKey: "x" as const },
        { player: 1 as const, wonKey: "wonO" as const, boardKey: "o" as const },
    ])("takes an immediate macro win for Player $player", (testCase) => {
        const state = getUltimateBoard();
        state.player = testCase.player;
        state.nextBoard = 2;
        state[testCase.wonKey] = 0b000000011;
        state[testCase.boardKey][2] = 0b000000011;

        expect(evaluateDFS(state, 2)).toBe(20);
    });
});
