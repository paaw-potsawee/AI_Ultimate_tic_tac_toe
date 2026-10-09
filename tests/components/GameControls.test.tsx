/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GameControls from "@/features/board/components/GameControls";
import { GameMode } from "@/types/gameMode";

const {
    backMock,
    clearBoardMock,
    leaveGameMock,
    togglePauseMock,
    useBoardStoreMock,
    useGameConfigStoreMock,
} = vi.hoisted(() => ({
    backMock: vi.fn(),
    clearBoardMock: vi.fn(),
    leaveGameMock: vi.fn(),
    togglePauseMock: vi.fn(),
    useBoardStoreMock: vi.fn(),
    useGameConfigStoreMock: vi.fn(),
}));

vi.mock("@/features/board/store/boardStore", () => ({
    useBoardStore: useBoardStoreMock,
    useGameConfigStore: useGameConfigStoreMock,
}));

const xMove = {
    player: 0,
    localRow: 0,
    localCol: 0,
    cellRow: 0,
    cellCol: 0,
    board: 0,
    cell: 0,
};
const oMove = { ...xMove, player: 1, cellCol: 1, cell: 1 };

const boardState = (overrides: Record<string, unknown> = {}) => ({
    back: backMock,
    clearBoard: clearBoardMock,
    togglePause: togglePauseMock,
    isPaused: false,
    winner: null,
    history: [xMove],
    ...overrides,
});

const configState = (overrides: Record<string, unknown> = {}) => ({
    leaveGame: leaveGameMock,
    mode: GameMode.PVP,
    humanPlayer: 0,
    ...overrides,
});

const undoButton = () =>
    screen.getByRole("button", { name: "Undo" }) as HTMLButtonElement;

describe("GameControls", () => {
    beforeEach(() => {
        backMock.mockReset();
        togglePauseMock.mockReset();
        useBoardStoreMock.mockReturnValue(boardState());
        useGameConfigStoreMock.mockReturnValue(configState());
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

        expect(undoButton()).toBeTruthy();
        expect(screen.queryByRole("button", { name: "Pause" })).toBeNull();
        expect(
            screen.getByRole("button", { name: "Main Menu" }).parentElement
                ?.className,
        ).toContain("grid-cols-3");
    });

    describe("Undo availability", () => {
        it("is disabled until a move exists in Player vs Player", () => {
            useBoardStoreMock.mockReturnValue(boardState({ history: [] }));

            render(<GameControls onBackToSetup={vi.fn()} />);

            expect(undoButton().disabled).toBe(true);
            fireEvent.click(undoButton());
            expect(backMock).not.toHaveBeenCalled();
        });

        it("undoes once there is a move in Player vs Player", () => {
            render(<GameControls onBackToSetup={vi.fn()} />);

            expect(undoButton().disabled).toBe(false);
            fireEvent.click(undoButton());
            expect(backMock).toHaveBeenCalledOnce();
        });

        it("stays disabled while only the AI has moved", () => {
            useGameConfigStoreMock.mockReturnValue(
                configState({ mode: GameMode.HEURISTIC_AI, humanPlayer: 1 }),
            );
            useBoardStoreMock.mockReturnValue(boardState({ history: [xMove] }));

            render(<GameControls onBackToSetup={vi.fn()} />);

            expect(undoButton().disabled).toBe(true);
        });

        it("enables once the human has made a move against the AI", () => {
            useGameConfigStoreMock.mockReturnValue(
                configState({ mode: GameMode.HEURISTIC_AI, humanPlayer: 1 }),
            );
            useBoardStoreMock.mockReturnValue(
                boardState({ history: [xMove, oMove] }),
            );

            render(<GameControls onBackToSetup={vi.fn()} />);

            expect(undoButton().disabled).toBe(false);
        });
    });

    describe("AI vs AI mode", () => {
        beforeEach(() => {
            useGameConfigStoreMock.mockReturnValue(
                configState({ mode: GameMode.AIVAI }),
            );
        });

        it("replaces Undo with a Pause button that toggles the match", () => {
            render(<GameControls onBackToSetup={vi.fn()} />);

            expect(screen.queryByRole("button", { name: "Undo" })).toBeNull();
            expect(
                screen.getByRole("button", { name: "Main Menu" }),
            ).toBeTruthy();
            expect(screen.getByRole("button", { name: "Reset" })).toBeTruthy();

            const pause = screen.getByRole("button", { name: "Pause" });
            expect(pause.getAttribute("aria-pressed")).toBe("false");
            expect((pause as HTMLButtonElement).disabled).toBe(false);

            fireEvent.click(pause);
            expect(togglePauseMock).toHaveBeenCalledOnce();
        });

        it("labels the button Resume while the match is paused", () => {
            useBoardStoreMock.mockReturnValue(boardState({ isPaused: true }));

            render(<GameControls onBackToSetup={vi.fn()} />);

            const resume = screen.getByRole("button", { name: "Resume" });
            expect(resume.getAttribute("aria-pressed")).toBe("true");
            expect(screen.queryByRole("button", { name: "Pause" })).toBeNull();
        });

        it("disables Pause once the match is over", () => {
            useBoardStoreMock.mockReturnValue(boardState({ winner: 0 }));

            render(<GameControls onBackToSetup={vi.fn()} />);

            const pause = screen.getByRole("button", { name: "Pause" });
            expect((pause as HTMLButtonElement).disabled).toBe(true);

            fireEvent.click(pause);
            expect(togglePauseMock).not.toHaveBeenCalled();
        });
    });
});
