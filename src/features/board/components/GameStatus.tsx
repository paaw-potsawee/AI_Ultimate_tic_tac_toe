import { useBoardStore } from "../store/boardStore";
import { cn } from "@/lib/cn";

const GameStatus = () => {
    const { winner, isAiTurn, currentPlayer, history } = useBoardStore();
    const isGameOver = winner !== null;
    const displayedPlayer =
        winner === 0 ? "X" : winner === 1 ? "O" : currentPlayer;
    const moveNumber = isGameOver ? history.length : history.length + 1;
    const isX = displayedPlayer === "X";
    const title =
        winner === -1
            ? "DRAW"
            : winner === 0
              ? "X WINS"
              : winner === 1
                ? "O WINS"
                : `${currentPlayer}'S TURN`;

    return (
        <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={cn(
                "flex h-24 w-full shrink-0 items-stretch border-3 border-black font-bold text-black",
                winner === -1
                    ? "bg-ocean-200"
                    : isX
                      ? "bg-peach"
                      : "bg-ocean-400",
            )}
        >
            <div
                className={cn(
                    "flex w-18 shrink-0 items-center justify-center border-r-3 border-black text-4xl font-black",
                    winner === -1
                        ? "bg-black text-white"
                        : isX
                          ? "bg-sunset-700 text-white"
                          : "bg-ocean-600 text-ocean-950",
                )}
            >
                {winner === -1 ? "=" : displayedPlayer}
            </div>

            <div className="flex min-w-0 flex-1 items-center justify-between gap-3 px-3 py-2">
                <div className="min-w-0">
                    <div className="text-[11px] font-black tracking-[0.18em] uppercase">
                        {isGameOver ? "GAME OVER" : `MOVE ${moveNumber}`}
                    </div>
                    <div className="truncate text-xl leading-tight font-black tracking-wide sm:text-2xl">
                        {title}
                    </div>
                    {!isGameOver && isAiTurn && (
                        <div className="animate-pulse text-xs font-black tracking-wider uppercase">
                            AI is thinking…
                        </div>
                    )}
                </div>

                {isGameOver && (
                    <div className="shrink-0 border-2 border-black bg-white/70 px-2 py-1 text-xs font-black whitespace-nowrap">
                        MOVE {moveNumber}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameStatus;
