import { useBoardStore } from "../../store/boardStore";

const MoveHistory = () => {
    const { history } = useBoardStore();

    return (
        <div className="text-sm text-gray-400 mt-2">
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
