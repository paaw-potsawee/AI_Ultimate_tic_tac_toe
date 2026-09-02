import { useBoardStore } from "@/store/boardStore";

const MoveHistory = () => {
    const { history } = useBoardStore();

    return (
        <div className="min-h-25 w-full flex-1 overflow-auto border-3 border-black bg-peach p-2 text-sm text-black lg:min-h-0">
            {history.length === 0 ? (
                <div className="text-black/60 italic">No moves yet</div>
            ) : (
                history.map((move, index) => (
                    <div key={index} className="whitespace-nowrap">
                        {index + 1}. Player {index % 2 === 0 ? "X" : "O"} played
                        at local board ({move.board % 3},{" "}
                        {Math.floor(move.board / 3)}), cell ({move.cell % 3},{" "}
                        {Math.floor(move.cell / 3)})
                    </div>
                ))
            )}
        </div>
    );
};

export default MoveHistory;
