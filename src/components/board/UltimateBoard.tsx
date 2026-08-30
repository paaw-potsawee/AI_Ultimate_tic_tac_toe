import LocalBoard from "@/components/board/LocalBoard";
import { useBoardStore } from "@/store/boardStore";

const UltimateBoard = () => {
    const { board } = useBoardStore();

    return (
        <div className="grid max-w-5xl grid-rows-3 p-4">
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
    );
};

export default UltimateBoard;
