import { describe, expect, it } from "vitest";
import { cloneUltimateBoard, getUltimateBoard } from "@/features/board";
import {
    calculateLocalBoardScore,
    calculateScore,
} from "@/features/ai/engine/heuristic/evaluation";

describe("heuristic evaluation", () => {
    it.each([
        { boardKey: "o" as const, bits: 0b000000011 },
        { boardKey: "x" as const, bits: 0b000000011 },
    ])("focuses the score on the forced board for $boardKey", (testCase) => {
        const forcedState = getUltimateBoard();
        forcedState[testCase.boardKey][0] = testCase.bits;
        forcedState.nextBoard = 0;

        const inactiveState = cloneUltimateBoard(forcedState);
        inactiveState.nextBoard = 1;

        expect(
            calculateScore(forcedState) - calculateScore(inactiveState),
        ).toBe(calculateLocalBoardScore(forcedState, 0));
    });
});
