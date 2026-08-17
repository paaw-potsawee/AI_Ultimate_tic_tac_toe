export type Move = "X" | "O" | null;
export type Player = "X" | "O";

export type LocalBoard = {
    board: Move[][];
    winner: Move;
};

export type UltimateBoard = LocalBoard[][];

export interface CellClickProps {
    localRow: number;
    localCol: number;
    cellRow: number;
    cellCol: number;
}

export type CellClickHandler = (props: CellClickProps) => void;
