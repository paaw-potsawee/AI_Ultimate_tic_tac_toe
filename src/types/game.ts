// 0 = X, 1 = O
export type Player = 0 | 1;

export interface Move {
    board: number;
    cell: number;
}

export interface GameState {
    /**
     * 9 local boards.
     * Each value uses bits 0–8 for cells.
     * 0 1 2
     * 3 4 5
     * 6 7 8
     * X X .
     * . X .
     * . . .
     * it becomes bits:
     * 0 1 2 3 4 5 6 7 8
     * 1 1 0 0 1 0 0 0 0
     */
    x: Uint16Array;
    o: Uint16Array;

    // Global 3×3 board.
    // Bit i = player has won local board i.
    wonX: number;
    wonO: number;

    // 0–8 = required local board.
    // 9 = player may choose any unfinished board.
    nextBoard: number;

    player: Player;
}
