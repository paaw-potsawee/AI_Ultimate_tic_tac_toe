import LocalBoard from "./LocalBoard";
import { useBoardStore, useOptionStore } from "../../store/boardStore";
import { gameModeOptions, parseGameMode, GameMode } from "../../types/gameMode";

const UltimateBoard = () => {
    const { board, clearBoard, back, currentPlayer, winner, history, isAiTurn } =
        useBoardStore();
    const { option, setOption, humanPlayer, setHumanPlayer } = useOptionStore();
    return (
        <>
            {option !== GameMode.PVP && (
                <div className="flex gap-4 mb-4">
                    <button
                        className={`border p-2 ${humanPlayer === 0 ? "bg-slate-700" : "hover:bg-slate-500"}`}
                        onClick={() => setHumanPlayer(0)}
                    >
                        Play as X
                    </button>
                    <button
                        className={`border p-2 ${humanPlayer === 1 ? "bg-slate-700" : "hover:bg-slate-500"}`}
                        onClick={() => setHumanPlayer(1)}
                    >
                        Play as O
                    </button>
                </div>
            )}
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
            <div>
                current player: {currentPlayer} playing vs {option}
            </div>
            <button className="border p-2 hover:bg-slate-500" onClick={back}>
                back
            </button>
            <button
                className="border p-2 hover:bg-slate-500"
                onClick={clearBoard}
            >
                Reset
            </button>
            <select
                value={option}
                onChange={(e) => setOption(parseGameMode(e.target.value))}
            >
                {gameModeOptions.map(({ value, label }) => (
                    <option key={value} value={value}>
                        {label}
                    </option>
                ))}
            </select>
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
