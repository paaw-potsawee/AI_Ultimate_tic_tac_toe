import { type UltimateBoard, type Player } from "./board";

export type MoveRecord = {
    player: Player;
    localRow: number;
    localCol: number;
    cellRow: number;
    cellCol: number;
};
export type GameState = {
    board: UltimateBoard;
    currentPlayer: Player;
    history: MoveRecord[];
};
