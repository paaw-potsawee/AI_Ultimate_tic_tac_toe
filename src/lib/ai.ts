import type { GameModeValue } from "../types/gameMode";
import type { GameState, Move } from "../types/game";
import { getAvailableMoves } from "./game";
import { evaluateHeuristic } from "./heuristicSearch";
import { GameMode } from "../types/gameMode";
import { evaluateDFS, evaluateBFS } from "./blindSearch";

export const getAiMove = (state: GameState, option: GameModeValue): Move => {
    const availableMoves = getAvailableMoves(state);
    let index: number;
    switch (option) {
        case GameMode.BLIND_DFS_AI:
            index = evaluateDFS(state);
            break;
        case GameMode.BLIND_BFS_AI:
            index = evaluateBFS(state);
            break;
        case GameMode.HEURISTIC_AI:
            index = evaluateHeuristic(state);
            break;
        default:
            throw new Error("Invalid option");
    }

    const encoded = availableMoves[index];
    return {
        player: state.player,
        localRow: Math.floor(Math.floor(encoded / 9) / 3),
        localCol: Math.floor(encoded / 9) % 3,
        cellRow: Math.floor((encoded % 9) / 3),
        cellCol: (encoded % 9) % 3,
        board: Math.floor(encoded / 9),
        cell: encoded % 9,
    };
};
