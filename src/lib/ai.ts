import type { GameModeValue } from "@/types/gameMode";
import type { GameState, Move } from "@/types/game";
import { evaluateHeuristic } from "@/lib/heuristicSearch";
import { GameMode } from "@/types/gameMode";
import { evaluateBFS } from "@/lib/bfs";
import { evaluateDFS } from "@/lib/dfs";
import { BOARD_CELL_COUNT } from "@/lib/gameRules";

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

    const board = Math.floor(encoded / BOARD_CELL_COUNT);
    const cell = encoded % BOARD_CELL_COUNT;

    return {
        player: state.player,
        localRow: Math.floor(board / 3),
        localCol: board % 3,
        cellRow: Math.floor(cell / 3),
        cellCol: cell % 3,
        board,
        cell,
    };
};
