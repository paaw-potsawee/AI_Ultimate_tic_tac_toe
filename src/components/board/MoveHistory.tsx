import { useBoardStore } from "@/store/boardStore";

const MoveHistory = () => {
    const { history } = useBoardStore();

    return (
        <div className="mt-2 h-full border-3 border-black bg-peach p-2 text-sm text-black">
            {history.map((move, index) => (
                <div key={index}>
                    {index + 1}. Player {index % 2 === 0 ? "X" : "O"} played at
                    local board ({move.board % 3}, {Math.floor(move.board / 3)}
                    ), cell ({move.cell % 3}, {Math.floor(move.cell / 3)})
                </div>
            ))}
        </div>
    );
};

export default MoveHistory;
