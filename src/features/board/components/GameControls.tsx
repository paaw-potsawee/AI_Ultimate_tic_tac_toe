import { useBoardStore, useGameConfigStore } from "../store/boardStore";
import { Button } from "@/components/ui";
import { GameMode } from "@/types/gameMode";

interface Props {
    onBackToSetup: () => void;
}

const GameControls = ({ onBackToSetup }: Props) => {
    const { back, clearBoard } = useBoardStore();
    const { leaveGame, mode } = useGameConfigStore();
    const isAiVsAi = mode === GameMode.AIVAI;

    const handleBackToSetup = () => {
        leaveGame();
        onBackToSetup();
    };

    return (
        <div
            className={`grid gap-2 ${isAiVsAi ? "grid-cols-2" : "grid-cols-3"}`}
        >
            {!isAiVsAi && (
                <Button
                    className="min-h-11 border-0 bg-ocean-200 px-2 py-2 text-sm font-bold text-teal sm:px-4 sm:text-base"
                    onClick={back}
                >
                    Undo
                </Button>
            )}
            <Button
                className="flex min-h-11 items-center justify-center border-0 bg-ocean-200 px-2 py-2 text-center text-sm font-bold text-black sm:px-4 sm:text-base"
                onClick={handleBackToSetup}
            >
                Main Menu
            </Button>
            <Button
                className="min-h-11 border-0 bg-ocean-200 px-2 py-2 text-sm font-bold text-sunset-900 sm:px-4 sm:text-base"
                onClick={clearBoard}
            >
                Reset
            </Button>
        </div>
    );
};

export default GameControls;
