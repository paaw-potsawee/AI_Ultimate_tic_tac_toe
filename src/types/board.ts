import type { WinLineType } from "@/types/winLine";

export interface CellPosition {
    localRow: number;
    localCol: number;
    cellRow: number;
    cellCol: number;
}

export type CellClickHandler = (props: CellPosition) => void;

export type RenderMove = "X" | "O" | null;

export type RenderLocalBoard = {
    board: RenderMove[][];
    winner: RenderMove;
    winningLine: WinLineType | null;
};

export type RenderBoard = RenderLocalBoard[][];
