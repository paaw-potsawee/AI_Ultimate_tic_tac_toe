import type { GameState } from "@/types/game";
import { getAvailableMoves, applyMove, checkGameWinner } from "@/lib/game";
import { Queue } from "@/lib/queue";

let nodesExplored = 0;

export const evaluateBFS = (state: GameState, depth: number): number | null => {
    const availableMoves = getAvailableMoves(state);
    if (availableMoves.length === 0) {
        return null;
    }
    const queue = new Queue<{
        state: GameState;
        move: number;
        depth: number;
    }>();
    for (let i = 0; i < availableMoves.length; i++) {
        const boardIdx = Math.floor(availableMoves[i] / 9);
        const cellIdx = availableMoves[i] % 9;
        const newState = applyMove(state, state.player, boardIdx, cellIdx);
        queue.enqueue({ state: newState, move: availableMoves[i], depth: 1 });
        nodesExplored++;
    }

    let bestNoneLosingMove: number | null = null;

    let player = state.player;

    while (!queue.isEmpty()) {
        const currentState = queue.dequeue();
        if (currentState === null) {
            // for safety, but this should not happen due to the isEmpty check
            continue;
        }
        let score = 0;
        const winner = checkGameWinner(currentState.state);
        if (winner !== null) {
            score = winner === state.player ? 1 : winner !== null ? -1 : 0;
            //  return index of this move
            if (score === 1) {
                console.log(
                    `Winning move found at index: ${currentState.move}, Total Nodes Explored: ${nodesExplored}`,
                );
                return currentState.move;
            }
            // store last non-losing move
            if (score === 0) {
                bestNoneLosingMove = currentState.move;
            } else {
                // losing line just skip it
                continue;
            }
        }
        if (bestNoneLosingMove !== null) {
            bestNoneLosingMove = currentState.move;
        }

        if (currentState.depth >= depth) {
            continue;
        }
        // continue to explore
        const availableMoves = getAvailableMoves(currentState.state);
        for (let i = 0; i < availableMoves.length; i++) {
            const boardIdx = Math.floor(availableMoves[i] / 9);
            const cellIdx = availableMoves[i] % 9;
            const newState = applyMove(
                currentState.state,
                player,
                boardIdx,
                cellIdx,
            );
            queue.enqueue({
                state: newState,
                move: availableMoves[i],
                depth: currentState.depth + 1,
            });
            nodesExplored++;
        }
    }
    console.log(
        `No winning move found, returning best non-losing move: ${bestNoneLosingMove}, Total Nodes Explored: ${nodesExplored}`,
    );
    return bestNoneLosingMove ?? availableMoves[0];
};
