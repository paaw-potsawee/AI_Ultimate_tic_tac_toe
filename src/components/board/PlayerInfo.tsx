import { useBoardStore, useGameConfigStore } from "../../store/boardStore";

const PlayerInfo = () => {
    const { currentPlayer } = useBoardStore();
    const { mode } = useGameConfigStore();

    return (
        <div>
            current player: {currentPlayer} playing vs {mode}
        </div>
    );
};

export default PlayerInfo;
