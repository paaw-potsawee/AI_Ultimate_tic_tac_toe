import { useBoardStore, useGameConfigStore } from "@/store/boardStore";
import Button from "@/components/ui/Button";

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
        <div className="flex justify-between gap-2">
            <Button
                className="border-0 bg-ocean-200 px-4 py-2 text-teal"
                onClick={back}
            >
                Undo
            </Button>
            <Button
                className="border-0 bg-ocean-200 px-4 py-2 text-black"
                onClick={handleBackToSetup}
            >
                MainMenu
            </Button>
            <Button
                className="border-0 bg-ocean-200 px-4 py-2 text-sunset-900"
                onClick={clearBoard}
            >
                Reset
            </Button>
        </div>
    );
};

export default GameControls;
