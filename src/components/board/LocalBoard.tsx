import Cell from "@/components/board/Cell";
import O from "@/components/board/O";
import WinningSlash from "@/components/board/WinningSlash";
import X from "@/components/board/X";
import { cn } from "@/lib/cn";
import { useBoardStore } from "@/store/boardStore";

interface Props {
    localRow: number;
    localCol: number;
}

const LocalBoard = ({ localRow, localCol }: Props) => {
    const { board, availableLocalBoards } = useBoardStore();
    const localData = board[localRow][localCol];
    const isAvailable = availableLocalBoards.some(
        (b) => b.localRow === localRow && b.localCol === localCol,
    );

    return (
        <div
            className={cn(
                "relative rounded-lg border-[3px] p-0.5 transition-colors",
                isAvailable ? "border-burgundy" : "border-transparent",
            )}
        >
            <div className="relative grid grid-cols-3 gap-px bg-ocean-200/60">
                {localData.board.map((row, cellRow) =>
                    row.map((_, cellCol) => (
                        <Cell
                            key={`${cellRow}-${cellCol}`}
                            cellClickProps={{
                                localRow,
                                localCol,
                                cellRow,
                                cellCol,
                            }}
                        />
                    )),
                )}

                {localData.winner && (
                    <div className="pointer-events-none absolute inset-0 z-20">
                        {localData.winner === "X" ? (
                            <X className="h-full w-full" />
                        ) : (
                            <O className="h-full w-full" />
                        )}
                    </div>
                )}

                {localData.winningLine && (
                    <WinningSlash
                        line={localData.winningLine}
                        strokeWidth={4}
                        strokeColor="#000000"
                    />
                )}
            </div>
        </div>
    );
};

export default LocalBoard;
