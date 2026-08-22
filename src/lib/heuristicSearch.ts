import type { GameState } from "../types/game";
import { getAvailableMoves } from "./game";

export const evaluateHeuristic = (state: GameState): number => {
    const availableMoves = getAvailableMoves(state);
    if (availableMoves.length === 0) {
        return 0;
    }
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return randomIndex;
};
