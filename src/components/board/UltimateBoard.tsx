import LocalBoard from "./LocalBoard";
import { useBoardStore } from "../../store/boardStore";

const UltimateBoard = () => {
    const { board, clearBoard, back, currentPlayer, winner, history } =
        useBoardStore();
    return (
        <>
            {winner !== null && (
                <div className="text-2xl font-bold text-green-500">
                    Winner: {winner === 0 ? "X" : "O"}
                </div>
            )}
            <div className="grid grid-rows-3 p-4 max-w-5xl">
                {board.map((rowBoards, row) => {
                    return (
                        <div className={`grid grid-cols-3`} key={row}>
                            {rowBoards.map((_, col) => (
                                <LocalBoard
                                    key={`${row}-${col}`}
                                    localRow={row}
                                    localCol={col}
                                />
                            ))}
                        </div>
                    );
                })}
            </div>
            <div>current player: {currentPlayer}</div>
            <button className="border p-2 hover:bg-slate-500" onClick={back}>
                back
            </button>
            <button
                className="border p-2 hover:bg-slate-500"
                onClick={clearBoard}
            >
                Reset
            </button>
            <div className="text-sm text-gray-400 mt-2">
                {history.map((move, index) => (
                    <div key={index}>
                        {index + 1}. Player {index % 2 === 0 ? "X" : "O"} played
                        at local board ({move.board % 3},{" "}
                        {Math.floor(move.board / 3)}), cell ({move.cell % 3},{" "}
                        {Math.floor(move.cell / 3)})
                    </div>
                ))}
            </div>
        </>
    );
};

export default UltimateBoard;
