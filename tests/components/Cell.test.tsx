/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

const storeState = (overrides: Record<string, unknown> = {}) => ({
    board: createBoard(),
    handleCellClick: vi.fn(),
    history: [],
    isAiTurn: false,
    review: null,
    availableLocalBoards: [],
    canHumanMove: false,
    ...overrides,
});

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

        useBoardStoreMock.mockImplementation(() =>
            storeState({ board, history }),
        );

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

describe("Cell while reviewing a past move", () => {
    beforeEach(() => {
        useBoardStoreMock.mockReset();
    });

    afterEach(cleanup);

    it("shows the reviewed position read-only instead of the live board", () => {
        const liveBoard = createBoard();
        liveBoard[0][0].board[0][0] = "X";
        liveBoard[1][2].board[2][1] = "O";

        const reviewBoard = createBoard();
        reviewBoard[0][0].board[0][0] = "X";

        const xMove = { ...xPosition, player: 0, board: 0, cell: 0 };
        const oMove = { ...oPosition, player: 1, board: 5, cell: 7 };
        const handleCellClick = vi.fn();

        useBoardStoreMock.mockReturnValue(
            storeState({
                board: liveBoard,
                handleCellClick,
                history: [xMove, oMove],
                review: {
                    moveIndex: 0,
                    moveNumber: 1,
                    move: xMove,
                    board: reviewBoard,
                },
            }),
        );

        render(
            <>
                <Cell cellClickProps={xPosition} />
                <Cell cellClickProps={oPosition} />
            </>,
        );

        const xCell = screen.getByRole("button", {
            name: /cell row 1, column 1: X, move 1/,
        });
        const oCell = screen.getByRole("button", {
            name: /cell row 3, column 2: empty/,
        });

        expect(xCell.getAttribute("aria-current")).toBe("step");
        expect(oCell.getAttribute("aria-current")).toBeNull();
        expect((xCell as HTMLButtonElement).disabled).toBe(true);
        expect((oCell as HTMLButtonElement).disabled).toBe(true);

        fireEvent.click(oCell);
        expect(handleCellClick).not.toHaveBeenCalled();
    });
});

describe("Cell hover affordance", () => {
    beforeEach(() => {
        useBoardStoreMock.mockReset();
    });

    afterEach(cleanup);

    const classesOf = (name: RegExp) =>
        screen.getByRole("button", { name }).className.split(" ");

    it("only invites clicks on empty cells of a board the rules allow", () => {
        const board = createBoard();
        board[0][0].board[0][0] = "X";

        useBoardStoreMock.mockReturnValue(
            storeState({
                board,
                history: [{ ...xPosition, player: 0, board: 0, cell: 0 }],
                canHumanMove: true,
                // Only the top-left board is open for the next move.
                availableLocalBoards: [
                    { localRow: 0, localCol: 0, cellRow: 0, cellCol: 0 },
                ],
            }),
        );

        render(
            <>
                <Cell cellClickProps={xPosition} />
                <Cell
                    cellClickProps={{
                        localRow: 0,
                        localCol: 0,
                        cellRow: 0,
                        cellCol: 1,
                    }}
                />
                <Cell cellClickProps={oPosition} />
            </>,
        );

        const playable = classesOf(/cell row 1, column 2: empty/);
        expect(playable).toContain("hover:bg-sunset-400");
        expect(playable).toContain("cursor-pointer");

        const occupied = classesOf(/cell row 1, column 1: X/);
        expect(occupied).not.toContain("hover:bg-sunset-400");
        expect(occupied).toContain("cursor-default");

        const wrongBoard = classesOf(/Board row 2, column 3.*: empty/);
        expect(wrongBoard).not.toContain("hover:bg-sunset-400");
        expect(wrongBoard).toContain("cursor-default");
    });

    it("drops the affordance when it is not the human's turn", () => {
        useBoardStoreMock.mockReturnValue(
            storeState({
                canHumanMove: false,
                availableLocalBoards: [
                    { localRow: 0, localCol: 0, cellRow: 0, cellCol: 0 },
                ],
            }),
        );

        render(<Cell cellClickProps={xPosition} />);

        const classes = classesOf(/cell row 1, column 1: empty/);
        expect(classes).not.toContain("hover:bg-sunset-400");
        expect(classes).toContain("cursor-default");
    });
});
