import type { GameState, Player } from "@/features/board/types/game";
import {
    getAvailableMoves,
    applyMove,
    checkGameWinner,
} from "@/features/board/game";
import { BOARD_CELL_COUNT } from "@/features/board/gameRules";
import { Queue } from "./queue";
import type { SearchContext } from "./shared/types";
import { visitNode } from "./shared/utils";
import { SEARCH_TIMEOUT } from "./shared/constants";
// borrow constant / scoring system from heuristic search for leaf in blind search
import { calculateScore } from "./heuristic/evaluation";
import { BoundedTranspositionTable } from "./shared/transpositionTable";
import { getZobristKey } from "./shared/zobrist";
import { WIN_SCORE } from "./heuristic";

const TIME_BUDGET_MS = 1000;

export const evaluateBFS = (state: GameState, depth: number): number | null => {
    const availableMoves = getAvailableMoves(state);
    if (availableMoves.length === 0) {
        return null;
    }
    const deadline = performance.now() + TIME_BUDGET_MS;
    const context: SearchContext = {
        deadline,
        nodes: 0,
        table: new BoundedTranspositionTable(),
    };
    const rootPlayer: Player = state.player;
    let fallbackMove: number | null = null;
    let fallbackScore = rootPlayer === 0 ? -Infinity : Infinity;

    try {
        const queue = new Queue<{
            state: GameState;
            rootMove: number;
            depth: number;
        }>();
        for (let i = 0; i < availableMoves.length; i++) {
            const boardIdx = Math.floor(availableMoves[i] / BOARD_CELL_COUNT);
            const cellIdx = availableMoves[i] % BOARD_CELL_COUNT;
            const newState = applyMove(state, boardIdx, cellIdx);
            queue.enqueue({
                state: newState,
                rootMove: availableMoves[i],
                depth: 1,
            });
        }

        while (!queue.isEmpty()) {
            const currentState = queue.dequeue();
            if (currentState === null) {
                // for safety, but this should not happen due to the isEmpty check
                continue;
            }
            visitNode(context);

            const key = getZobristKey(currentState.state);

            const cached = context.table.get(key);
            if (cached !== undefined && cached.depth <= currentState.depth) {
                continue;
            }

            context.table.set(key, {
                value: 0,
                depth: currentState.depth,
                bestMove: currentState.rootMove,
                flag: "EXACT",
            });
            const winner = checkGameWinner(currentState.state);
            // hit terminal state or depth limit (leaf node)
            if (winner !== null || currentState.depth >= depth) {
                // if winner line can return immedietly
                if (winner === rootPlayer) return currentState.rootMove;
                // assume it is a lost then ovverides if draw or non-terminal node
                let score = rootPlayer === 0 ? -WIN_SCORE : WIN_SCORE;
                if (winner == null) score = -calculateScore(currentState.state);
                else if (winner === -1) score = 0;
                // set fall back move
                if (rootPlayer === 0) {
                    fallbackMove =
                        fallbackScore > score
                            ? fallbackMove
                            : currentState.rootMove;
                    fallbackScore = Math.max(score, fallbackScore);
                } else {
                    fallbackMove =
                        fallbackScore < score
                            ? fallbackMove
                            : currentState.rootMove;
                    fallbackScore = Math.min(score, fallbackScore);
                }
                continue;
            }
            const moves = getAvailableMoves(currentState.state);
            for (let i = 0; i < moves.length; i++) {
                const boardIdx = Math.floor(moves[i] / BOARD_CELL_COUNT);
                const cellIdx = moves[i] % BOARD_CELL_COUNT;
                const newState = applyMove(
                    currentState.state,
                    boardIdx,
                    cellIdx,
                );
                queue.enqueue({
                    state: newState,
                    rootMove: currentState.rootMove,
                    depth: currentState.depth + 1,
                });
            }
        }
    } catch (error) {
        if (error !== SEARCH_TIMEOUT) throw error;
    }
    return fallbackMove ?? availableMoves[0];
};
