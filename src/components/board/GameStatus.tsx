import { useBoardStore } from "@/store/boardStore";

const GameStatus = () => {
    const { winner, isAiTurn } = useBoardStore();

    return (
        <div className="flex h-14 w-full shrink-0 items-center justify-center border-3 border-black bg-ocean-200 px-4 text-center font-bold">
            {winner !== null ? (
                winner === -1 ? (
                    <div className="text-xl font-bold text-sunset-900">
                        Draw!
                    </div>
                ) : (
                    <div className="text-xl font-bold text-green-600">
                        Winner: {winner === 0 ? "X" : "O"}
                    </div>
                )
            ) : isAiTurn ? (
                <div className="animate-pulse text-lg font-bold text-ocean-800">
                    AI is thinking...
                </div>
            ) : (
                <div className="text-base font-semibold text-black/70 italic">
                    In progress
                </div>
            )}
        </div>
    );
};

export default GameStatus;
