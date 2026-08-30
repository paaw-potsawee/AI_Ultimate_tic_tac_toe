import { useBoardStore } from "@/store/boardStore";
import { type CellPosition } from "@/types/board";

interface CellProps {
    cellClickProps: CellPosition;
}

const Cell = ({ cellClickProps }: CellProps) => {
    const { board, handleCellClick, isAiTurn } = useBoardStore();
    const { localRow, localCol, cellRow, cellCol } = cellClickProps;
    return (
        <button
            className={`flex aspect-square w-[10vw] max-w-20 items-center justify-center border border-slate-600 ${isAiTurn ? "cursor-not-allowed opacity-70" : "hover:bg-slate-700"}`}
            onClick={() => handleCellClick(cellClickProps)}
            disabled={isAiTurn}
        >
            {board[localRow][localCol].board[cellRow][cellCol]}
        </button>
    );
};
export default Cell;
