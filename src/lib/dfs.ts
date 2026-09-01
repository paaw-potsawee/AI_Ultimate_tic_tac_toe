import type { GameState } from "@/types/game";
import { getAvailableMoves, checkGameWinner, applyMove } from "@/lib/game";

let nodesExplored = 0;

const dfs = (state: GameState, depth: number = 5): number => {
    const winner = checkGameWinner(state);
    if (depth === 0 || winner !== null) {
        return winner === state.player ? 1 : winner !== null ? -1 : 0;
    }
    let bestScore = -Infinity;
    const availableMoves = getAvailableMoves(state);
    for (let i = 0; i < availableMoves.length; i++) {
        nodesExplored++;
        const val = dfs(
            applyMove(
                state,
                state.player,
                Math.floor(availableMoves[i] / 9),
                availableMoves[i] % 9,
            ),
            depth - 1,
        );
        bestScore = Math.max(bestScore, val);
    }

    return bestScore;
};

export const evaluateDFS = (state: GameState, depth: number): number | null => {
    const availableMoves = getAvailableMoves(state);
    if (availableMoves.length === 0) {
        return null;
    }
    for (let i = 0; i < availableMoves.length; i++) {
        const boardIdx = Math.floor(availableMoves[i] / 9);
        const cellIdx = availableMoves[i] % 9;

        console.log(`Exploring move: Board ${boardIdx}, Cell ${cellIdx}`);
        const newState = applyMove(state, state.player, boardIdx, cellIdx);

        // call dfs
        const score = dfs(newState, depth - 1);
        console.log(
            `Move: Board ${boardIdx}, Cell ${cellIdx}, Score: ${score}, Total Nodes Explored: ${nodesExplored}`,
        );

        // accept move that doesn't lead to a loss
        if (score > 0) {
            return i;
        }
    }
    // fallback to first move if all moves lead to a loss
    return availableMoves.length > 0 ? 0 : null;
};
