import type { GameState } from "@/types/game";
import { getAvailableMoves, applyMove, checkGameWinner } from "@/lib/game";

// ============================================================================
// AI Core Logic (Heuristic & Minimax) สำหรับระบบ Bitboard
// ============================================================================

// 1. ฟังก์ชันประเมินคะแนนกระดาน (อิงจากผู้เล่น O หรือ Player 1 เป็นฝ่ายได้คะแนนบวก)
const calculateScore = (state: GameState): number => {
    const gameWinner = checkGameWinner(state); //[cite: 4]
    if (gameWinner === 1) return 100000; // O (Player 1) ชนะ
    if (gameWinner === 0) return -100000; // X (Player 0) ชนะ

    let score = 0;
    const posWeights = [3, 2, 3, 2, 4, 2, 3, 2, 3];

    // ประเมินกระดานใหญ่และกระดานเล็กโดยใช้ Bitwise Operator[cite: 4]
    for (let i = 0; i < 9; i++) {
        // หาก O ยึดกระดานใหญ่นี้ได้
        if ((state.wonO & (1 << i)) !== 0) {
            score += 100 * posWeights[i];
        }
        // หาก X ยึดกระดานใหญ่นี้ได้
        else if ((state.wonX & (1 << i)) !== 0) {
            score -= 100 * posWeights[i];
        }
        // หากกระดานยังไม่ถูกยึด ให้ประเมินเบี้ยในกระดานเล็ก
        else {
            const boardMultiplier = posWeights[i];
            for (let c = 0; c < 9; c++) {
                const bit = 1 << c;
                if ((state.o[i] & bit) !== 0) {
                    score += 5 * posWeights[c] * boardMultiplier;
                } else if ((state.x[i] & bit) !== 0) {
                    score -= 5 * posWeights[c] * boardMultiplier;
                }
            }
        }
    }

    // Penalty สำหรับ Free Move (ค่า state.nextBoard เป็น 9 หมายถึงลงช่องไหนก็ได้)[cite: 4]
    if (state.nextBoard === 9) {
        if (state.player === 0) {
            // ตาต่อไปเป็นของ X แปลว่าตาที่แล้ว O เพิ่งเดินและทำให้ X ได้ Free Move
            score -= 5000;
        } else {
            // ตาต่อไปเป็นของ O แปลว่าตาที่แล้ว X เพิ่งเดินและทำให้ O ได้ Free Move
            score += 5000;
        }
    }

    return score;
};

// 2. อัลกอริทึม Minimax พร้อม Alpha-Beta Pruning
const minimax = (
    state: GameState,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
): number => {
    const winner = checkGameWinner(state); //[cite: 4]
    if (winner !== null || depth === 0) return calculateScore(state);

    const legalMoves = getAvailableMoves(state); //[cite: 4]
    if (legalMoves.length === 0) return calculateScore(state);

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of legalMoves) {
            const boardIdx = Math.floor(move / 9);
            const cellIdx = move % 9;
            // จำลองการเดินหมากของ O (Player 1) ด้วย applyMove เพื่อสร้าง State ใหม่[cite: 4]
            const newState = applyMove(state, 1, boardIdx, cellIdx);
            const evalScore = minimax(newState, depth - 1, alpha, beta, false);
            maxEval = Math.max(maxEval, evalScore);
            alpha = Math.max(alpha, evalScore);
            if (beta <= alpha) break; // Pruning
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of legalMoves) {
            const boardIdx = Math.floor(move / 9);
            const cellIdx = move % 9;
            // จำลองการเดินหมากของ X (Player 0)[cite: 4]
            const newState = applyMove(state, 0, boardIdx, cellIdx);
            const evalScore = minimax(newState, depth - 1, alpha, beta, true);
            minEval = Math.min(minEval, evalScore);
            beta = Math.min(beta, evalScore);
            if (beta <= alpha) break; // Pruning
        }
        return minEval;
    }
};

// ============================================================================
// Interface หลัก
// ============================================================================

export const evaluateHeuristic = (state: GameState): number => {
    const availableMoves = getAvailableMoves(state); //[cite: 4]
    if (availableMoves.length === 0) return 0;
    if (availableMoves.length === 1) return 0;

    let bestIndex = 0;
    let alpha = -Infinity;
    let beta = Infinity;
    const depth = 4; // หากการคำนวณทำให้ตัวเกมหน่วงเกินไป สามารถลดความลึกลงเหลือ 3 ได้

    const aiPlayer = state.player; // รับค่าผู้เล่นปัจจุบัน (0 = X, 1 = O)[cite: 4]
    // ถ้า AI เล่นเป็น O (1) ต้องการค่า Max แต่ถ้าเล่นเป็น X (0) ต้องการค่า Min
    const isMaximizing = aiPlayer === 1;
    let bestValue = isMaximizing ? -Infinity : Infinity;

    // Move Ordering: ลำดับคิวตาเดินเพื่อเสริมประสิทธิภาพให้ Alpha-Beta Pruning
    const movesWithIndex = availableMoves.map((move, index) => {
        const cell = move % 9;
        let priority = 1;
        if (cell === 4)
            priority = 3; // ช่องตรงกลางมีน้ำหนักสูงสุด
        else if ([0, 2, 6, 8].includes(cell)) priority = 2; // ตามด้วยช่องมุม
        return { move, index, priority };
    });

    movesWithIndex.sort((a, b) => b.priority - a.priority);

    for (const item of movesWithIndex) {
        const boardIdx = Math.floor(item.move / 9);
        const cellIdx = item.move % 9;

        // จำลองการเดินของ AI ในตานี้[cite: 4]
        const newState = applyMove(state, aiPlayer, boardIdx, cellIdx);

        if (isMaximizing) {
            const boardValue = minimax(newState, depth - 1, alpha, beta, false);
            if (boardValue > bestValue) {
                bestValue = boardValue;
                bestIndex = item.index;
            }
            alpha = Math.max(alpha, boardValue);
        } else {
            const boardValue = minimax(newState, depth - 1, alpha, beta, true);
            if (boardValue < bestValue) {
                bestValue = boardValue;
                bestIndex = item.index;
            }
            beta = Math.min(beta, boardValue);
        }

        if (beta <= alpha) break; // Pruning ระดับชั้นบนสุด
    }

    return bestIndex;
};
