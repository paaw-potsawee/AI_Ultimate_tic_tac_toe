import { useBoardStore } from "../store/boardStore";
import type { CellPosition } from "../types/board";
import { cn } from "@/lib/cn";
import X from "./X";
import O from "./O";

interface CellProps {
    cellClickProps: CellPosition;
}

const Cell = ({ cellClickProps }: CellProps) => {
    const {
        board,
        handleCellClick,
        history,
        isAiTurn,
        review,
        availableLocalBoards,
        canHumanMove,
    } = useBoardStore();
    const { localRow, localCol, cellRow, cellCol } = cellClickProps;
    // While reviewing a past move the cell shows that position, read-only.
    const shownBoard = review ? review.board : board;
    const value = shownBoard[localRow][localCol].board[cellRow][cellCol];
    const lastMove = review ? review.move : history[history.length - 1];
    const isLastMove =
        lastMove?.localRow === localRow &&
        lastMove.localCol === localCol &&
        lastMove.cellRow === cellRow &&
        lastMove.cellCol === cellCol;
    // Only an empty cell inside a board the rules currently allow can take a
    // mark, so only those cells get the hover highlight and pointer cursor.
    // Use the boards of the position being shown (review or live) so the
    // affordance always agrees with the outline LocalBoard draws.
    const shownAvailableBoards = review
        ? review.availableLocalBoards
        : availableLocalBoards;
    const isPlayable =
        Boolean(canHumanMove) &&
        !value &&
        shownAvailableBoards.some(
            (b) => b.localRow === localRow && b.localCol === localCol,
        );
    const positionLabel = `Board row ${localRow + 1}, column ${localCol + 1}; cell row ${cellRow + 1}, column ${cellCol + 1}`;
    const lastMoveLabel = review ? `move ${review.moveNumber}` : "last move";

    return (
        <button
            type="button"
            aria-current={isLastMove ? "step" : undefined}
            aria-label={
                value
                    ? `${positionLabel}: ${value}${isLastMove ? `, ${lastMoveLabel}` : ""}`
                    : `${positionLabel}: empty`
            }
            className={cn(
                "relative flex aspect-square w-full min-w-0 items-center justify-center bg-orange p-0 transition-colors",
                isPlayable
                    ? "cursor-pointer hover:bg-sunset-400"
                    : "cursor-default",
                isAiTurn && !review && "cursor-not-allowed opacity-70",
                isLastMove &&
                    (value === "X"
                        ? "bg-sunset-400/55 shadow-[inset_0_0_0_2px_rgba(174,32,18,0.5)]"
                        : "bg-ocean-400/45 shadow-[inset_0_0_0_2px_rgba(0,95,115,0.5)]"),
            )}
            onClick={() => handleCellClick(cellClickProps)}
            // Mirror the store's own gate: nothing is clickable while the
            // game is over, an AI side is to move, or a past move is shown.
            disabled={!canHumanMove}
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
