/** @vitest-environment jsdom */

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GameStatus from "@/features/board/components/GameStatus";

const { useBoardStoreMock } = vi.hoisted(() => ({
    useBoardStoreMock: vi.fn(),
}));

vi.mock("@/features/board/store/boardStore", () => ({
    useBoardStore: useBoardStoreMock,
}));

describe("GameStatus", () => {
    beforeEach(() => {
        useBoardStoreMock.mockReset();
    });

    afterEach(cleanup);

    it("shows player X and the first move at the start of a game", () => {
        useBoardStoreMock.mockReturnValue({
            winner: null,
            isAiTurn: false,
            currentPlayer: "X",
            history: [],
        });

        render(<GameStatus />);

        const status = screen.getByRole("status");
        expect(within(status).getByText("MOVE 1")).toBeTruthy();
        expect(within(status).getByText("X'S TURN")).toBeTruthy();
    });

    it("keeps the current player prominent while the AI is thinking", () => {
        useBoardStoreMock.mockReturnValue({
            winner: null,
            isAiTurn: true,
            currentPlayer: "O",
            history: [{}],
        });

        render(<GameStatus />);

        const status = screen.getByRole("status");
        expect(within(status).getByText("MOVE 2")).toBeTruthy();
        expect(within(status).getByText("O'S TURN")).toBeTruthy();
        expect(within(status).getByText("AI is thinking…")).toBeTruthy();
    });

    it.each([
        { winner: 0, title: "X WINS", mark: "X" },
        { winner: 1, title: "O WINS", mark: "O" },
        { winner: -1, title: "DRAW", mark: "=" },
    ])("shows $title with the final move number", ({ winner, title, mark }) => {
        useBoardStoreMock.mockReturnValue({
            winner,
            isAiTurn: false,
            currentPlayer: "X",
            history: [{}, {}, {}],
        });

        render(<GameStatus />);

        const status = screen.getByRole("status");
        expect(within(status).getByText(title)).toBeTruthy();
        expect(within(status).getByText(mark)).toBeTruthy();
        expect(within(status).getByText("MOVE 3")).toBeTruthy();
        expect(within(status).getByText("GAME OVER")).toBeTruthy();
    });
});
