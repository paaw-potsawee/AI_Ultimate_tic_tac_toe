import { useBoardStore } from "@/store/boardStore";

const GameStatus = () => {
    const { winner, isAiTurn } = useBoardStore();
    return (
        <>
            {winner !== null && (
                <div className="text-2xl font-bold text-green-500">
                    Winner: {winner === 0 ? "X" : "O"}
                </div>
            )}
            {isAiTurn && (
                <div className="text-xl font-bold text-blue-400">
                    AI is thinking...
                </div>
            )}
        </>
    );
};

export default GameStatus;
