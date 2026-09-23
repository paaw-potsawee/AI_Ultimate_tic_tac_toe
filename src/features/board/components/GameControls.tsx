import { useBoardStore, useGameConfigStore } from "../store/boardStore";
import { Button } from "@/components/ui";

interface Props {
    onBackToSetup: () => void;
}

const GameControls = ({ onBackToSetup }: Props) => {
    const { back, clearBoard } = useBoardStore();
    const { leaveGame } = useGameConfigStore();

    const handleBackToSetup = () => {
        leaveGame();
        onBackToSetup();
    };

    return (
        <div className="grid grid-cols-3 gap-2">
            <Button
                className="min-h-11 border-0 bg-ocean-200 px-2 py-2 text-sm font-bold text-teal sm:px-4 sm:text-base"
                onClick={back}
            >
                Undo
            </Button>
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
