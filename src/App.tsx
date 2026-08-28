import { useState } from "react";
import UltimateBoard from "./components/board/UltimateBoard";
import GameStatus from "./components/board/GameStatus";
import PlayerInfo from "./components/board/PlayerInfo";
import GameControls from "./components/board/GameControls";
import MoveHistory from "./components/board/MoveHistory";
import Header from "./components/header/Header";
import SelectMode from "./components/setup/SelectMode";
import SelectSide from "./components/setup/SelectSide";
import { useGameConfigStore } from "./store/boardStore";
import { GameMode, type GameModeValue } from "./types/gameMode";

function App() {
    const [screen, setScreen] = useState<
        "select-mode" | "select-side" | "board"
    >("select-mode");
    const { mode, startGame } = useGameConfigStore();
    const [draftMode, setDraftMode] = useState<GameModeValue>(mode);

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            {screen === "select-mode" && (
                <SelectMode
                    initialMode={draftMode}
                    onNext={(selectedMode) => {
                        setDraftMode(selectedMode);
                        if (selectedMode === GameMode.PVP) {
                            startGame(selectedMode, 0);
                            setScreen("board");
                        } else {
                            setScreen("select-side");
                        }
                    }}
                />
            )}
            {screen === "select-side" && (
                <SelectSide
                    onStartGame={(side) => {
                        startGame(draftMode, side);
                        setScreen("board");
                    }}
                />
            )}
            {screen === "board" && (
                <div className="flex flex-col items-center pb-6">
                    <GameStatus />
                    <UltimateBoard />
                    <PlayerInfo />
                    <div className="my-2 flex gap-2">
                        <GameControls
                            onBackToSetup={() => setScreen("select-mode")}
                        />
                    </div>
                    <MoveHistory />
                </div>
            )}
        </div>
    );
}

export default App;
