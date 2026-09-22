/** @vitest-environment jsdom */

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MoveHistory from "@/features/board/components/MoveHistory";

const { useBoardStoreMock } = vi.hoisted(() => ({
    useBoardStoreMock: vi.fn(),
}));

vi.mock("@/features/board/store/boardStore", () => ({
    useBoardStore: useBoardStoreMock,
}));

describe("MoveHistory", () => {
    beforeEach(() => {
        useBoardStoreMock.mockReset();
    });

    afterEach(cleanup);

    it("shows an empty state before the first move", () => {
        useBoardStoreMock.mockReturnValue({ history: [] });

        render(<MoveHistory />);

        expect(screen.getByText("0 MOVES")).toBeTruthy();
        expect(screen.getByText("No moves recorded yet")).toBeTruthy();
    });

    it("shows newest moves first with player data and one-based positions", () => {
        useBoardStoreMock.mockReturnValue({
            history: [
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
            ],
        });

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
});
