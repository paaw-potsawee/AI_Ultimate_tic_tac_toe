import { useBoardStore, useGameConfigStore } from "../store/boardStore";
import { GameMode, gameModeOptions, getAiModeOption } from "@/types/gameMode";

const PlayerInfo = () => {
    const { currentPlayer } = useBoardStore();
    const { mode, aiPlayers } = useGameConfigStore();

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
            {mode === GameMode.AIVAI ? (
                <div className="grid w-full grid-cols-2 gap-2 font-bold">
                    <div className="border-2 border-black bg-peach p-2 text-sunset-900">
                        X · {getAiModeOption(aiPlayers[0]).shortLabel}
                    </div>
                    <div className="border-2 border-black bg-ocean-400 p-2 text-ocean-950">
                        O · {getAiModeOption(aiPlayers[1]).shortLabel}
                    </div>
                </div>
            ) : (
                <div className="bg-ocean-200 p-2 font-bold">
                    {gameModeOptions[mode].label}
                </div>
            )}
        </div>
    );
};

export default PlayerInfo;
