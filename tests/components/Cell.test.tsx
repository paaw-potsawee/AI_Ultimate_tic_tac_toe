/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Cell from "@/features/board/components/Cell";
import type { RenderBoard } from "@/features/board/types/board";

const { useBoardStoreMock } = vi.hoisted(() => ({
    useBoardStoreMock: vi.fn(),
}));

vi.mock("@/features/board/store/boardStore", () => ({
    useBoardStore: useBoardStoreMock,
}));

const createBoard = (): RenderBoard =>
    Array.from({ length: 3 }, () =>
        Array.from({ length: 3 }, () => ({
            board: Array.from({ length: 3 }, () => Array(3).fill(null)),
            winner: null,
            winningLine: null,
        })),
    );

const xPosition = {
    localRow: 0,
    localCol: 0,
    cellRow: 0,
    cellCol: 0,
};

const oPosition = {
    localRow: 1,
    localCol: 2,
    cellRow: 2,
    cellCol: 1,
};

describe("Cell last-move indicator", () => {
    beforeEach(() => {
        useBoardStoreMock.mockReset();
    });

    afterEach(cleanup);

    it("marks only the newest move and follows the history after undo", () => {
        const board = createBoard();
        board[0][0].board[0][0] = "X";
        board[1][2].board[2][1] = "O";

        const xMove = { ...xPosition, player: 0, board: 0, cell: 0 };
        const oMove = { ...oPosition, player: 1, board: 5, cell: 7 };
        let history = [xMove, oMove];

        useBoardStoreMock.mockImplementation(() => ({
            board,
            handleCellClick: vi.fn(),
            history,
            isAiTurn: false,
        }));

        const view = render(
            <>
                <Cell cellClickProps={xPosition} />
                <Cell cellClickProps={oPosition} />
            </>,
        );

        const xCell = screen.getByRole("button", {
            name: /cell row 1, column 1: X/,
        });
        const oCell = screen.getByRole("button", {
            name: /cell row 3, column 2: O, last move/,
        });

        expect(xCell.getAttribute("aria-current")).toBeNull();
        expect(oCell.getAttribute("aria-current")).toBe("step");

        history = [xMove];
        view.rerender(
            <>
                <Cell cellClickProps={xPosition} />
                <Cell cellClickProps={oPosition} />
            </>,
        );

        expect(xCell.getAttribute("aria-current")).toBe("step");
        expect(oCell.getAttribute("aria-current")).toBeNull();
    });
});
