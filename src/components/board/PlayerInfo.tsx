import { useBoardStore, useGameConfigStore } from "@/store/boardStore";
import { gameModeOptions } from "@/types/gameMode";

const PlayerInfo = () => {
    const { currentPlayer } = useBoardStore();
    const { mode } = useGameConfigStore();

    return (
        <div className="flex flex-col items-start gap-2">
            <div className="bg-ocean-200 p-2 font-bold italic">
                Playing: &nbsp;
                <span
                    className={`${currentPlayer === "X" ? "text-sunset-700" : "text-teal"}`}
                >
                    {currentPlayer}
                </span>
            </div>
            <div className="bg-ocean-200 p-2 font-bold">
                {gameModeOptions[mode].label}
            </div>
        </div>
    );
};

export default PlayerInfo;
