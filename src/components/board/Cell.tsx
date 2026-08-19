import { useBoardStore } from "../../store/boardStore";
import { type CellPosition } from "../../types/board";

interface CellProps {
    cellClickProps: CellPosition;
}

const Cell = ({ cellClickProps }: CellProps) => {
    const { board, handleCellClick, isAiTurn } = useBoardStore();
    const { localRow, localCol, cellRow, cellCol } = cellClickProps;
    return (
        <button
            className={`flex items-center justify-center w-full aspect-square border border-slate-600 ${isAiTurn ? "opacity-70 cursor-not-allowed" : "hover:bg-slate-700"}`}
            onClick={() => handleCellClick(cellClickProps)}
            disabled={isAiTurn}
        >
            {board[localRow][localCol].board[cellRow][cellCol]}
        </button>
    );
};
export default Cell;
