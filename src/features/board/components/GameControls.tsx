import { useBoardStore, useGameConfigStore } from "../store/boardStore";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { GameMode } from "@/types/gameMode";

interface Props {
    onBackToSetup: () => void;
}

const GameControls = ({ onBackToSetup }: Props) => {
    const { back, clearBoard, isPaused, togglePause, winner, history } =
        useBoardStore();
    const { leaveGame, mode, humanPlayer } = useGameConfigStore();
    const isAiVsAi = mode === GameMode.AIVAI;
    const isGameOver = winner !== null;
    // Against an AI, only the human's own moves can be taken back; undoing the
    // AI's opening move would just make it play the opening again.
    const canUndo =
        mode === GameMode.PVP
            ? history.length > 0
            : history.some((move) => move.player === humanPlayer);

    const handleBackToSetup = () => {
        leaveGame();
        onBackToSetup();
    };

    return (
        <div className="grid grid-cols-3 gap-2">
            {isAiVsAi ? (
                <Button
                    aria-pressed={isPaused}
                    disabled={isGameOver}
                    className={cn(
                        "min-h-11 border-0 px-2 py-2 text-sm font-bold transition-colors sm:px-4 sm:text-base",
                        isPaused
                            ? "bg-sunset-400 text-black"
                            : "bg-ocean-200 text-teal",
                        isGameOver && "cursor-not-allowed opacity-50",
                    )}
                    onClick={togglePause}
                >
                    {isPaused ? "Resume" : "Pause"}
                </Button>
            ) : (
                <Button
                    disabled={!canUndo}
                    className={cn(
                        "min-h-11 border-0 bg-ocean-200 px-2 py-2 text-sm font-bold text-teal sm:px-4 sm:text-base",
                        !canUndo && "cursor-not-allowed opacity-50",
                    )}
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
