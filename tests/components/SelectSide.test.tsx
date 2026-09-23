/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SelectSide } from "@/components/setup";

describe("SelectSide", () => {
    afterEach(cleanup);

    it("returns to mode selection when Back is clicked", () => {
        const onBack = vi.fn();

        render(<SelectSide onBack={onBack} onStartGame={vi.fn()} />);

        fireEvent.click(screen.getByRole("button", { name: "← Back" }));

        expect(onBack).toHaveBeenCalledTimes(1);
    });

    it("starts the game with the selected player side", () => {
        const onStartGame = vi.fn();

        render(<SelectSide onBack={vi.fn()} onStartGame={onStartGame} />);

        fireEvent.click(screen.getByRole("button", { name: "X" }));
        fireEvent.click(screen.getByRole("button", { name: "O" }));

        expect(onStartGame).toHaveBeenNthCalledWith(1, 0);
        expect(onStartGame).toHaveBeenNthCalledWith(2, 1);
    });
});
