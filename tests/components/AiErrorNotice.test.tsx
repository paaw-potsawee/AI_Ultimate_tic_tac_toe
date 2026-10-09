/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AiErrorNotice from "@/features/board/components/AiErrorNotice";

const { useBoardStoreMock, retryAiMoveMock } = vi.hoisted(() => ({
    useBoardStoreMock: vi.fn(),
    retryAiMoveMock: vi.fn(),
}));

vi.mock("@/features/board/store/boardStore", () => ({
    useBoardStore: useBoardStoreMock,
}));

describe("AiErrorNotice", () => {
    beforeEach(() => {
        useBoardStoreMock.mockReset();
        retryAiMoveMock.mockReset();
    });

    afterEach(cleanup);

    it("renders nothing while the AI is healthy", () => {
        useBoardStoreMock.mockReturnValue({
            aiError: null,
            retryAiMove: retryAiMoveMock,
            winner: null,
        });

        const { container } = render(<AiErrorNotice />);

        expect(container.innerHTML).toBe("");
    });

    it("shows the failure and lets the user ask the AI again", () => {
        useBoardStoreMock.mockReturnValue({
            aiError: "No available moves",
            retryAiMove: retryAiMoveMock,
            winner: null,
        });

        render(<AiErrorNotice />);

        const alert = screen.getByRole("alert");
        expect(alert.textContent).toContain("AI could not move");
        expect(alert.textContent).toContain("No available moves");

        fireEvent.click(screen.getByRole("button", { name: "Retry" }));
        expect(retryAiMoveMock).toHaveBeenCalledOnce();
    });

    it("stays hidden once the game is over", () => {
        useBoardStoreMock.mockReturnValue({
            aiError: "No available moves",
            retryAiMove: retryAiMoveMock,
            winner: -1,
        });

        const { container } = render(<AiErrorNotice />);

        expect(container.innerHTML).toBe("");
    });
});
