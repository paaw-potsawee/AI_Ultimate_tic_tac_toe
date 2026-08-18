import type { GameState } from "../types/game";
import { getAvailableMoves } from "./game";

export const evaluateHeuristic = (state: GameState): number => {
    // return random value from available moves for now
    const availableMoves = getAvailableMoves(state);
    if (availableMoves.length === 0) {
        return 0; // No available moves, return neutral score
    }
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return randomIndex; // Return a random index as heuristic value
};
