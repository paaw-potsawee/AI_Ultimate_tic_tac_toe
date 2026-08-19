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

export const getAiMove = (
    state: GameState,
): { board: number; cell: number } => {
    const availableMoves = getAvailableMoves(state);
    const index = evaluateHeuristic(state);
    const encoded = availableMoves[index];
    return {
        board: Math.floor(encoded / 9),
        cell: encoded % 9,
    };
};
