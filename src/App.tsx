import { useState } from "react";
import UltimateBoard from "@/components/board/UltimateBoard";
import PlayerInfo from "@/components/board/PlayerInfo";
import GameControls from "@/components/board/GameControls";
import MoveHistory from "@/components/board/MoveHistory";
import Header from "@/components/header/Header";
import SelectMode from "@/components/setup/SelectMode";
import SelectSide from "@/components/setup/SelectSide";
import { useGameConfigStore } from "@/store/boardStore";
import { GameMode, type GameModeValue } from "@/types/gameMode";

function App() {
    const [screen, setScreen] = useState<
        "select-mode" | "select-side" | "board"
    >("select-mode");
    const { mode, startGame } = useGameConfigStore();
    const [draftMode, setDraftMode] = useState<GameModeValue>(mode);

    return (
        <div className="flex min-h-screen flex-col items-center">
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
                <div className="flex flex-col pb-4 lg:flex-row">
                    {/* <GameStatus /> */}
                    <UltimateBoard />
                    <div className="flex flex-col gap-2 p-2">
                        <PlayerInfo />
                        <GameControls
                            onBackToSetup={() => setScreen("select-mode")}
                        />
                        <MoveHistory />
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
