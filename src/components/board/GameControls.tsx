import { useBoardStore, useGameConfigStore } from "../../store/boardStore";

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
        <>
            <button className="border p-2 hover:bg-slate-500" onClick={back}>
                back
            </button>
            <button
                className="border p-2 hover:bg-slate-500"
                onClick={clearBoard}
            >
                Reset
            </button>
            <button
                className="border p-2 hover:bg-slate-500"
                onClick={handleBackToSetup}
            >
                Back to setup
            </button>
        </>
    );
};

export default GameControls;
