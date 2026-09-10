import { describe, expect, it } from "vitest";
import { checkGameWinner, getUltimateBoard } from "@/lib/game";

const DRAWN_X_BOARD = 0b110001101;
const DRAWN_O_BOARD = 0b001110010;

const fillWithDrawnLocalBoards = () => {
    const state = getUltimateBoard();
    state.x.fill(DRAWN_X_BOARD);
    state.o.fill(DRAWN_O_BOARD);
    return state;
};

describe("checkGameWinner", () => {
    it("detects macro winners before considering a draw", () => {
        const xState = fillWithDrawnLocalBoards();
        xState.wonX = 0b000000111;
        expect(checkGameWinner(xState)).toBe(0);

        const oState = fillWithDrawnLocalBoards();
        oState.wonO = 0b000000111;
        expect(checkGameWinner(oState)).toBe(1);
    });

    it("detects a draw when every local board is drawn", () => {
        expect(checkGameWinner(fillWithDrawnLocalBoards())).toBe(-1);
    });

    it("detects a draw when won and drawn local boards close the board", () => {
        const state = fillWithDrawnLocalBoards();
        state.wonX = (1 << 0) | (1 << 4);
        state.wonO = (1 << 1) | (1 << 5);
        state.x[0] = 0b000000111;
        state.o[0] = 0;
        state.x[4] = 0b000000111;
        state.o[4] = 0;
        state.x[1] = 0;
        state.o[1] = 0b000000111;
        state.x[5] = 0;
        state.o[5] = 0b000000111;

        expect(checkGameWinner(state)).toBe(-1);
    });

    it("keeps the game ongoing while a local board remains playable", () => {
        const state = fillWithDrawnLocalBoards();
        state.x[8] = 0;
        state.o[8] = 0;

        expect(checkGameWinner(state)).toBeNull();
    });
});
