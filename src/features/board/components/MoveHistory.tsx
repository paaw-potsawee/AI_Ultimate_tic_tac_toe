import { useBoardStore } from "../store/boardStore";
import { cn } from "@/lib/cn";

const MoveHistory = () => {
    const { history, review, reviewMove, exitReview } = useBoardStore();
    const movesNewestFirst = history
        .map((move, index) => ({ move, moveIndex: index }))
        .reverse();

    return (
        <section className="flex min-h-40 w-full flex-1 flex-col overflow-hidden border-3 border-black bg-ocean-200 text-black lg:min-h-0">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b-3 border-black bg-peach px-3 py-2">
                <h2 className="text-sm font-black tracking-wider uppercase">
                    Move History
                </h2>
                <div className="flex items-center gap-2">
                    {review && (
                        <button
                            type="button"
                            aria-label="Back to live game"
                            onClick={exitReview}
                            className="border-2 border-black bg-burgundy px-2 py-0.5 text-xs font-black tracking-wider text-white uppercase shadow-[2px_2px_0_#000] transition-colors hover:bg-sunset-900"
                        >
                            ↩ Live
                        </button>
                    )}
                    <span className="border-2 border-black bg-black px-2 py-0.5 text-xs font-bold text-white">
                        {history.length}{" "}
                        {history.length === 1 ? "MOVE" : "MOVES"}
                    </span>
                </div>
            </div>

            {history.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-1 px-4 py-6 text-center">
                    <div className="text-sm font-bold">
                        No moves recorded yet
                    </div>
                    <div className="text-xs text-black/60">
                        Each move will appear here. Tap one to see the board as
                        it was at that point.
                    </div>
                </div>
            ) : (
                <ol
                    aria-label="Move history, newest first"
                    className="flex flex-1 flex-col gap-2 overflow-y-auto p-2"
                >
                    {movesNewestFirst.map(({ move, moveIndex }, index) => {
                        const moveNumber = moveIndex + 1;
                        const player = move.player === 0 ? "X" : "O";
                        const isLatest = index === 0;
                        const isViewing = review?.moveIndex === moveIndex;

                        return (
                            <li
                                key={moveNumber}
                                aria-current={isLatest ? "step" : undefined}
                                className={cn(
                                    "shrink-0 border-2 border-l-6 border-black transition-colors",
                                    player === "X"
                                        ? "border-l-sunset-700"
                                        : "border-l-ocean-600",
                                    isViewing
                                        ? "bg-ocean-400 shadow-[3px_3px_0_#000] ring-2 ring-black ring-inset"
                                        : isLatest
                                          ? "bg-white shadow-[3px_3px_0_#000] hover:bg-ocean-200/60"
                                          : "bg-white/65 hover:bg-white",
                                )}
                            >
                                <button
                                    type="button"
                                    aria-pressed={isViewing}
                                    title={
                                        isViewing
                                            ? "Back to live game"
                                            : `View the board after move ${moveNumber}`
                                    }
                                    onClick={() =>
                                        isViewing
                                            ? exitReview()
                                            : reviewMove(moveIndex)
                                    }
                                    className="block w-full p-2 text-left"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span
                                                aria-label={`Player ${player}`}
                                                className={cn(
                                                    "flex h-7 w-7 items-center justify-center border-2 border-black text-base font-black",
                                                    player === "X"
                                                        ? "bg-sunset-700 text-white"
                                                        : "bg-ocean-400 text-ocean-950",
                                                )}
                                            >
                                                {player}
                                            </span>
                                            <span className="text-sm font-black tracking-wide">
                                                MOVE {moveNumber}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {isViewing && (
                                                <span className="bg-burgundy px-2 py-0.5 text-[10px] font-black tracking-wider text-white uppercase">
                                                    Viewing
                                                </span>
                                            )}
                                            {isLatest && (
                                                <span className="bg-black px-2 py-0.5 text-[10px] font-black tracking-wider text-white uppercase">
                                                    Latest
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                                        <div className="border border-black/30 bg-peach/45 px-2 py-1">
                                            <div className="text-[10px] font-black tracking-wider uppercase">
                                                Board
                                            </div>
                                            <div className="text-xs font-semibold whitespace-nowrap">
                                                ROW {move.localRow + 1} · COL{" "}
                                                {move.localCol + 1}
                                            </div>
                                        </div>
                                        <span
                                            aria-hidden="true"
                                            className="text-base font-black"
                                        >
                                            →
                                        </span>
                                        <div className="border border-black/30 bg-ocean-400/45 px-2 py-1">
                                            <div className="text-[10px] font-black tracking-wider uppercase">
                                                Cell
                                            </div>
                                            <div className="text-xs font-semibold whitespace-nowrap">
                                                ROW {move.cellRow + 1} · COL{" "}
                                                {move.cellCol + 1}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            </li>
                        );
                    })}
                </ol>
            )}
        </section>
    );
};

export default MoveHistory;
