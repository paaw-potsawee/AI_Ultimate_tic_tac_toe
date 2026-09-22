import type { GameState } from "@/features/board/types/game";

// Deterministic PRNG ensures identical Zobrist keys across worker restarts without crypto dependencies.
const mulberry32 = (seed: number): (() => number) => {
    let s = seed;
    return (): number => {
        s = (s + 0x6d2b79f5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return (t ^ (t >>> 14)) >>> 0;
    };
};

const _rng = mulberry32(0xdeadbeef);

export const ZOBRIST_X: number[][] = Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, _rng),
);

export const ZOBRIST_O: number[][] = Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, _rng),
);

export const ZOBRIST_WON_X: number[] = Array.from({ length: 9 }, _rng);

export const ZOBRIST_WON_O: number[] = Array.from({ length: 9 }, _rng);

export const ZOBRIST_NEXT_BOARD: number[] = Array.from({ length: 10 }, _rng);

export const ZOBRIST_PLAYER: [number, number] = [_rng(), _rng()];

export const getZobristHash = (state: GameState): number => {
    let h = ZOBRIST_PLAYER[state.player] ^ ZOBRIST_NEXT_BOARD[state.nextBoard];

    for (let board = 0; board < 9; board++) {
        let xBits = state.x[board];
        let oBits = state.o[board];

        for (let cell = 0; cell < 9; cell++) {
            if (xBits & 1) h ^= ZOBRIST_X[board][cell];
            if (oBits & 1) h ^= ZOBRIST_O[board][cell];
            xBits >>= 1;
            oBits >>= 1;
        }

        if ((state.wonX >> board) & 1) h ^= ZOBRIST_WON_X[board];
        if ((state.wonO >> board) & 1) h ^= ZOBRIST_WON_O[board];
    }

    return h >>> 0;
};
