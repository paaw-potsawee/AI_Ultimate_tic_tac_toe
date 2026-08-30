import { useBoardStore } from "@/store/boardStore";
import { type CellPosition } from "@/types/board";
import X from "@/components/board/X";
import O from "@/components/board/O";

interface CellProps {
    cellClickProps: CellPosition;
}

const Cell = ({ cellClickProps }: CellProps) => {
    const { board, handleCellClick, isAiTurn } = useBoardStore();
    const { localRow, localCol, cellRow, cellCol } = cellClickProps;
    const value = board[localRow][localCol].board[cellRow][cellCol];

    return (
        <button
            type="button"
            className={`flex aspect-square w-[10vw] max-w-16 items-center justify-center bg-orange p-0 transition-colors ${
                isAiTurn
                    ? "cursor-not-allowed opacity-70"
                    : value
                      ? ""
                      : "hover:bg-sunset-400"
            }`}
            onClick={() => handleCellClick(cellClickProps)}
            disabled={isAiTurn}
        >
            {value === "X" ? <X /> : value === "O" ? <O /> : null}
        </button>
    );
};

export default Cell;
