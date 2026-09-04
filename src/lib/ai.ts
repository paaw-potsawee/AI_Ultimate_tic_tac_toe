import type { GameModeValue } from "@/types/gameMode";
import type { GameState, Move } from "@/types/game";
import { evaluateHeuristic } from "@/lib/heuristicSearch";
import { GameMode } from "@/types/gameMode";
import { evaluateBFS } from "@/lib/bfs";
import { evaluateDFS } from "@/lib/dfs";

export const getAiMove = (state: GameState, option: GameModeValue): Move => {
    let encoded: number | null;
    switch (option) {
        case GameMode.BLIND_DFS_AI:
            encoded = evaluateDFS(state, 5);
            break;
        case GameMode.BLIND_BFS_AI:
            encoded = evaluateBFS(state, 5);
            break;
        case GameMode.HEURISTIC_AI:
        case GameMode.AIVAI:
            encoded = evaluateHeuristic(state);
            break;
        default:
            throw new Error("Invalid option");
    }

    if (encoded === null) {
        throw new Error("No available moves");
    }
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
