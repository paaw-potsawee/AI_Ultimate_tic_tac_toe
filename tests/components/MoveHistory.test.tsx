/** @vitest-environment jsdom */

import {
    cleanup,
    fireEvent,
    render,
    screen,
    within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MoveHistory from "@/features/board/components/MoveHistory";

const { useBoardStoreMock, reviewMoveMock, exitReviewMock } = vi.hoisted(
    () => ({
        useBoardStoreMock: vi.fn(),
        reviewMoveMock: vi.fn(),
        exitReviewMock: vi.fn(),
    }),
);

vi.mock("@/features/board/store/boardStore", () => ({
    useBoardStore: useBoardStoreMock,
}));

const history = [
    {
        player: 1,
        localRow: 0,
        localCol: 1,
        cellRow: 1,
        cellCol: 2,
        board: 1,
        cell: 5,
    },
    {
        player: 0,
        localRow: 2,
        localCol: 0,
        cellRow: 0,
        cellCol: 1,
        board: 6,
        cell: 1,
    },
];

const storeState = (overrides: Record<string, unknown> = {}) => ({
    history,
    review: null,
    reviewMove: reviewMoveMock,
    exitReview: exitReviewMock,
    ...overrides,
});

describe("MoveHistory", () => {
    beforeEach(() => {
        useBoardStoreMock.mockReset();
        reviewMoveMock.mockReset();
        exitReviewMock.mockReset();
    });

    afterEach(cleanup);

    it("shows an empty state before the first move", () => {
        useBoardStoreMock.mockReturnValue(storeState({ history: [] }));

        render(<MoveHistory />);

        expect(screen.getByText("0 MOVES")).toBeTruthy();
        expect(screen.getByText("No moves recorded yet")).toBeTruthy();
    });

    it("shows newest moves first with player data and one-based positions", () => {
        useBoardStoreMock.mockReturnValue(storeState());

        render(<MoveHistory />);

        const moves = screen.getAllByRole("listitem");
        expect(moves).toHaveLength(2);
        expect(moves[0].getAttribute("aria-current")).toBe("step");
        expect(moves[1].getAttribute("aria-current")).toBeNull();

        expect(within(moves[0]).getByText("MOVE 2")).toBeTruthy();
        expect(within(moves[0]).getByLabelText("Player X")).toBeTruthy();
        expect(within(moves[0]).getByText("ROW 3 · COL 1")).toBeTruthy();
        expect(within(moves[0]).getByText("ROW 1 · COL 2")).toBeTruthy();
        expect(within(moves[0]).getByText("Latest")).toBeTruthy();

        expect(within(moves[1]).getByText("MOVE 1")).toBeTruthy();
        expect(within(moves[1]).getByLabelText("Player O")).toBeTruthy();
        expect(within(moves[1]).queryByText("Latest")).toBeNull();
    });

    it("asks the store to review a move when its entry is clicked", () => {
        useBoardStoreMock.mockReturnValue(storeState());

        render(<MoveHistory />);

        const moves = screen.getAllByRole("listitem");
        fireEvent.click(within(moves[1]).getByRole("button"));

        expect(reviewMoveMock).toHaveBeenCalledWith(0);
        expect(exitReviewMock).not.toHaveBeenCalled();
        expect(
            screen.queryByRole("button", { name: "Back to live game" }),
        ).toBeNull();
    });

    it("marks the reviewed move and offers a way back to the live game", () => {
        useBoardStoreMock.mockReturnValue(
            storeState({
                review: { moveIndex: 0, moveNumber: 1, move: history[0] },
            }),
        );

        render(<MoveHistory />);

        const moves = screen.getAllByRole("listitem");
        const reviewed = within(moves[1]).getByRole("button");
        expect(reviewed.getAttribute("aria-pressed")).toBe("true");
        expect(within(moves[1]).getByText("Viewing")).toBeTruthy();
        expect(within(moves[0]).queryByText("Viewing")).toBeNull();
        expect(
            within(moves[0]).getByRole("button").getAttribute("aria-pressed"),
        ).toBe("false");

        fireEvent.click(reviewed);
        expect(exitReviewMock).toHaveBeenCalledOnce();
        expect(reviewMoveMock).not.toHaveBeenCalled();

        fireEvent.click(
            screen.getByRole("button", { name: "Back to live game" }),
        );
        expect(exitReviewMock).toHaveBeenCalledTimes(2);
    });
});
