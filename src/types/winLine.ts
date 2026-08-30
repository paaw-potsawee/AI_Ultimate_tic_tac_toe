import type { Player } from "@/types/game";

export type WinLineType =
    | "row-0"
    | "row-1"
    | "row-2"
    | "col-0"
    | "col-1"
    | "col-2"
    | "diag-main"
    | "diag-anti";

export interface GameWinLine {
    winner: Player;
    line: WinLineType;
}
