import LocalBoard from "@/components/board/LocalBoard";
import WinningSlash from "@/components/board/WinningSlash";
import { useBoardStore } from "@/store/boardStore";

const UltimateBoard = () => {
    const { board, gameWinningLine } = useBoardStore();

    return (
        <div className="relative shrink-0 self-start border-4 border-black bg-orange p-1 sm:p-2">
            <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <line
                    x1="33.33"
                    y1="1"
                    x2="33.33"
                    y2="31.5"
                    stroke="#e9d8a6"
                    strokeWidth="1.5"
                />
                <line
                    x1="33.33"
                    y1="35.1"
                    x2="33.33"
                    y2="64.9"
                    stroke="#e9d8a6"
                    strokeWidth="1.5"
                />
                <line
                    x1="33.33"
                    y1="68.5"
                    x2="33.33"
                    y2="99"
                    stroke="#e9d8a6"
                    strokeWidth="1.5"
                />

                <line
                    x1="66.67"
                    y1="1"
                    x2="66.67"
                    y2="31.5"
                    stroke="#e9d8a6"
                    strokeWidth="1.5"
                />
                <line
                    x1="66.67"
                    y1="35.1"
                    x2="66.67"
                    y2="64.9"
                    stroke="#e9d8a6"
                    strokeWidth="1.5"
                />
                <line
                    x1="66.67"
                    y1="68.5"
                    x2="66.67"
                    y2="99"
                    stroke="#e9d8a6"
                    strokeWidth="1.5"
                />

                <line
                    x1="1"
                    y1="33.33"
                    x2="31.5"
                    y2="33.33"
                    stroke="#e9d8a6"
                    strokeWidth="1.5"
                />
                <line
                    x1="35.1"
                    y1="33.33"
                    x2="64.9"
                    y2="33.33"
                    stroke="#e9d8a6"
                    strokeWidth="1.5"
                />
                <line
                    x1="68.5"
                    y1="33.33"
                    x2="99"
                    y2="33.33"
                    stroke="#e9d8a6"
                    strokeWidth="1.5"
                />

                <line
                    x1="1"
                    y1="66.67"
                    x2="31.5"
                    y2="66.67"
                    stroke="#e9d8a6"
                    strokeWidth="1.5"
                />
                <line
                    x1="35.1"
                    y1="66.67"
                    x2="64.9"
                    y2="66.67"
                    stroke="#e9d8a6"
                    strokeWidth="1.5"
                />
                <line
                    x1="68.5"
                    y1="66.67"
                    x2="99"
                    y2="66.67"
                    stroke="#e9d8a6"
                    strokeWidth="1.5"
                />
            </svg>

            <div className="relative grid grid-cols-3 gap-1 sm:gap-2">
                {board.map((rowBoards, row) =>
                    rowBoards.map((_, col) => (
                        <LocalBoard
                            key={`${row}-${col}`}
                            localRow={row}
                            localCol={col}
                        />
                    )),
                )}
            </div>

            {gameWinningLine && (
                <WinningSlash
                    line={gameWinningLine.line}
                    strokeWidth={8}
                    strokeColor="#000000"
                    className="z-30"
                />
            )}
        </div>
    );
};

export default UltimateBoard;
