/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GameControls from "@/features/board/components/GameControls";
import { GameMode } from "@/types/gameMode";

const { backMock, clearBoardMock, leaveGameMock, useGameConfigStoreMock } =
    vi.hoisted(() => ({
        backMock: vi.fn(),
        clearBoardMock: vi.fn(),
        leaveGameMock: vi.fn(),
        useGameConfigStoreMock: vi.fn(),
    }));

vi.mock("@/features/board/store/boardStore", () => ({
    useBoardStore: () => ({
        back: backMock,
        clearBoard: clearBoardMock,
    }),
    useGameConfigStore: useGameConfigStoreMock,
}));

describe("GameControls", () => {
    beforeEach(() => {
        useGameConfigStoreMock.mockReturnValue({
            leaveGame: leaveGameMock,
            mode: GameMode.PVP,
        });
    });

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

    it("shows Undo and three columns outside AI vs AI mode", () => {
        render(<GameControls onBackToSetup={vi.fn()} />);

        expect(screen.getByRole("button", { name: "Undo" })).toBeTruthy();
        expect(
            screen.getByRole("button", { name: "Main Menu" }).parentElement
                ?.className,
        ).toContain("grid-cols-3");
    });

    it("hides Undo and uses two equal columns in AI vs AI mode", () => {
        useGameConfigStoreMock.mockReturnValue({
            leaveGame: leaveGameMock,
            mode: GameMode.AIVAI,
        });

        render(<GameControls onBackToSetup={vi.fn()} />);

        expect(screen.queryByRole("button", { name: "Undo" })).toBeNull();
        expect(screen.getByRole("button", { name: "Main Menu" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Reset" })).toBeTruthy();
        expect(
            screen.getByRole("button", { name: "Main Menu" }).parentElement
                ?.className,
        ).toContain("grid-cols-2");
    });
});
