/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SelectAiMatch } from "@/components/setup";
import { GameMode } from "@/types/gameMode";

describe("SelectAiMatch", () => {
    afterEach(cleanup);

    it("lets X and O independently choose any AI engine", () => {
        const onStartGame = vi.fn();

        render(<SelectAiMatch onBack={vi.fn()} onStartGame={onStartGame} />);

        expect(
            screen.getByRole("button", {
                name: "Use Heuristic for player X",
            }),
        ).toBeTruthy();
        expect(
            screen.getByRole("button", {
                name: "Use Blind DFS for player X",
            }),
        ).toBeTruthy();
        expect(
            screen.getByRole("button", {
                name: "Use Blind BFS for player X",
            }),
        ).toBeTruthy();
        expect(
            screen.getByRole("button", {
                name: "Use Heuristic for player O",
            }),
        ).toBeTruthy();
        expect(
            screen.getByRole("button", {
                name: "Use Blind DFS for player O",
            }),
        ).toBeTruthy();
        expect(
            screen.getByRole("button", {
                name: "Use Blind BFS for player O",
            }),
        ).toBeTruthy();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Use Blind DFS for player X",
            }),
        );
        fireEvent.click(
            screen.getByRole("button", {
                name: "Use Heuristic for player O",
            }),
        );
        fireEvent.click(screen.getByRole("button", { name: /start game/i }));

        expect(onStartGame).toHaveBeenCalledWith(
            GameMode.BLIND_DFS_AI,
            GameMode.HEURISTIC_AI,
        );
    });
});
