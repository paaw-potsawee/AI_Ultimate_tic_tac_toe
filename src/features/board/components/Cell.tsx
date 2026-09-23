import { useBoardStore } from "../store/boardStore";
import type { CellPosition } from "../types/board";
import { cn } from "@/lib/cn";
import X from "./X";
import O from "./O";

interface CellProps {
    cellClickProps: CellPosition;
}

const Cell = ({ cellClickProps }: CellProps) => {
    const { board, handleCellClick, history, isAiTurn } = useBoardStore();
    const { localRow, localCol, cellRow, cellCol } = cellClickProps;
    const value = board[localRow][localCol].board[cellRow][cellCol];
    const lastMove = history[history.length - 1];
    const isLastMove =
        lastMove?.localRow === localRow &&
        lastMove.localCol === localCol &&
        lastMove.cellRow === cellRow &&
        lastMove.cellCol === cellCol;
    const positionLabel = `Board row ${localRow + 1}, column ${localCol + 1}; cell row ${cellRow + 1}, column ${cellCol + 1}`;

    return (
        <button
            type="button"
            aria-current={isLastMove ? "step" : undefined}
            aria-label={
                value
                    ? `${positionLabel}: ${value}${isLastMove ? ", last move" : ""}`
                    : `${positionLabel}: empty`
            }
            className={cn(
                "relative flex aspect-square w-full min-w-0 items-center justify-center bg-orange p-0 transition-colors",
                isAiTurn
                    ? "cursor-not-allowed opacity-70"
                    : !value && "hover:bg-sunset-400",
                isLastMove &&
                    (value === "X"
                        ? "bg-sunset-400/55 shadow-[inset_0_0_0_2px_rgba(174,32,18,0.5)]"
                        : "bg-ocean-400/45 shadow-[inset_0_0_0_2px_rgba(0,95,115,0.5)]"),
            )}
            onClick={() => handleCellClick(cellClickProps)}
            disabled={isAiTurn}
        >
            {value === "X" ? <X /> : value === "O" ? <O /> : null}
            {isLastMove && (
                <span
                    aria-hidden="true"
                    className={cn(
                        "pointer-events-none absolute top-[8%] right-[8%] z-30 size-[14%] min-h-1 min-w-1 rounded-full border border-black/35",
                        value === "X" ? "bg-sunset-700" : "bg-ocean-600",
                    )}
                />
            )}
        </button>
    );
};

export default Cell;
