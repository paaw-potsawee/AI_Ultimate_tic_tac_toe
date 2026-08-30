import Cell from "@/components/board/Cell";
import { useBoardStore } from "@/store/boardStore";

interface Props {
    localRow: number;
    localCol: number;
}

const LocalBoard = ({ localRow, localCol }: Props) => {
    const { board, availableLocalBoards } = useBoardStore();

    return (
        <>
            {board[localRow][localCol].winner ? (
                <div className="grid place-items-center border-2 border-amber-100 text-4xl">
                    {board[localRow][localCol].winner}
                </div>
            ) : (
                <div
                    className={`grid grid-cols-3 gap-0 border-2 p-2 ${
                        availableLocalBoards.some(
                            (board) =>
                                board.localRow === localRow &&
                                board.localCol === localCol,
                        )
                            ? "border-green-500"
                            : "border-white"
                    }`}
                >
                    {board[localRow][localCol].board.map((row, cellCol) => {
                        return (
                            <div
                                className={`w-full ${board[localRow][localCol].winner ? "bg-green-500" : ""}`}
                                key={cellCol}
                            >
                                {row.map((_, cellRow) => {
                                    return (
                                        <Cell
                                            key={`${cellRow}-${cellCol}`}
                                            cellClickProps={{
                                                localRow,
                                                localCol,
                                                cellRow,
                                                cellCol,
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
};

export default LocalBoard;
