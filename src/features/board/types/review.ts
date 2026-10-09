import type { CellPosition, RenderBoard } from "./board";
import type { GameResult, Move } from "./game";
import type { GameWinLine } from "./winLine";

/**
 * A read-only snapshot of the board as it looked right after a given move.
 * Used by the move log to let the user look back at an earlier position
 * without touching the live game state.
 */
export interface ReviewSnapshot {
    /** 0-based index into the move history. */
    moveIndex: number;
    /** 1-based move number shown to the user. */
    moveNumber: number;
    /** The move that produced this position. */
    move: Move;
    board: RenderBoard;
    gameWinningLine: GameWinLine | null;
    /** Local boards the next player was allowed to play in at that point. */
    availableLocalBoards: CellPosition[];
    winner: GameResult;
}
