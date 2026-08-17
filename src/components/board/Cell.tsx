import { useBoardStore } from "../../store/boardStore";
import { type CellClickProps } from "../../types/board";

interface CellProps {
    cellClickProps: CellClickProps;
}

const Cell = ({ cellClickProps }: CellProps) => {
    const { board, handleCellClick } = useBoardStore();
    const { localRow, localCol, cellRow, cellCol } = cellClickProps;
    return (
        <button
            className="flex items-center justify-center w-full aspect-square border border-slate-600 hover:bg-slate-700"
            onClick={() => handleCellClick(cellClickProps)}
        >
            {board[localRow][localCol].board[cellRow][cellCol]}
        </button>
    );
};
export default Cell;
