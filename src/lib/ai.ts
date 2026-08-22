import type { GameModeValue } from "../types/gameMode";
import type { GameState, Move } from "../types/game";
import { getAvailableMoves } from "./game";
import { evaluateHeuristic } from "./heuristicSearch";
import { GameMode } from "../types/gameMode";
import { evaluateDFS } from "./blindSearch";

export const getAiMove = (state: GameState, option: GameModeValue): Move => {
    const availableMoves = getAvailableMoves(state);
    let index: number;
    switch (option) {
        case GameMode.BLIND_AI:
            index = evaluateDFS(state);
            break;
        case GameMode.HEURISTIC_AI:
            index = evaluateHeuristic(state);
            break;
        default:
            throw new Error("Invalid option");
    }

    const encoded = availableMoves[index];
    return {
        board: Math.floor(encoded / 9),
        cell: encoded % 9,
    };
};
