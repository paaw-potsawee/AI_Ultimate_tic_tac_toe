/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import GameControls from "@/features/board/components/GameControls";

const { backMock, clearBoardMock, leaveGameMock } = vi.hoisted(() => ({
    backMock: vi.fn(),
    clearBoardMock: vi.fn(),
    leaveGameMock: vi.fn(),
}));

vi.mock("@/features/board/store/boardStore", () => ({
    useBoardStore: () => ({
        back: backMock,
        clearBoard: clearBoardMock,
    }),
    useGameConfigStore: () => ({ leaveGame: leaveGameMock }),
}));

describe("GameControls", () => {
    afterEach(cleanup);

    it("centers the Main Menu label inside its button", () => {
        render(<GameControls onBackToSetup={vi.fn()} />);

        const button = screen.getByRole("button", { name: "Main Menu" });
        const classes = button.className.split(" ");

        expect(classes).toContain("flex");
        expect(classes).toContain("items-center");
        expect(classes).toContain("justify-center");
        expect(classes).toContain("text-center");
    });
});
