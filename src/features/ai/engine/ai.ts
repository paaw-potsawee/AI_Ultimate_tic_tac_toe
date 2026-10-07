import type { AiModeValue } from "@/types/gameMode";
import type { GameState, Move } from "@/features/board/types/game";
import { evaluateHeuristic } from "./heuristicSearch";
import { GameMode } from "@/types/gameMode";
import { evaluateBFS } from "./bfs";
import { evaluateDFS } from "./dfs";
import { BOARD_CELL_COUNT } from "@/features/board/gameRules";

export interface AiResult {
    move: Move;
    nodes: number;
}

export const getAiMove = (
    state: GameState,
    algorithm: AiModeValue,
): AiResult => {
    let encoded: number | null;
    let nodes = 0;
    switch (algorithm) {
        case GameMode.BLIND_DFS_AI:
            ({ move: encoded, nodes } = evaluateDFS(state, 10));
            break;
        case GameMode.BLIND_BFS_AI:
            ({ move: encoded, nodes } = evaluateBFS(state, 10));
            break;
        case GameMode.HEURISTIC_AI:
            ({ move: encoded, nodes } = evaluateHeuristic(state));
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
        move: {
            player: state.player,
            localRow: Math.floor(board / 3),
            localCol: board % 3,
            cellRow: Math.floor(cell / 3),
            cellCol: cell % 3,
            board,
            cell,
        },
        nodes,
    };
};
