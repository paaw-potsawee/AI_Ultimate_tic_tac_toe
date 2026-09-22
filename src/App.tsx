import { useState } from "react";
import {
    UltimateBoard,
    GameStatus,
    PlayerInfo,
    GameControls,
    MoveHistory,
    useGameConfigStore,
} from "@/features/board";
import { useAiWorker } from "@/features/ai";
import { Header } from "@/components/header";
import { SelectAiMatch, SelectMode, SelectSide } from "@/components/setup";
import { GameMode, type GameModeValue } from "@/types/gameMode";

function App() {
    // Manages the AI Web Worker lifecycle and wires it to the board store.
    useAiWorker();
    const [screen, setScreen] = useState<
        "select-mode" | "select-side" | "select-ai" | "board"
    >("select-mode");
    const { startGame } = useGameConfigStore();
    const [draftMode, setDraftMode] = useState<GameModeValue>(GameMode.PVP);

    return (
        <div className="flex min-h-screen flex-col items-center">
            <Header />
            {screen === "select-mode" && (
                <SelectMode
                    onNext={(selectedMode) => {
                        setDraftMode(selectedMode);
                        if (selectedMode === GameMode.PVP) {
                            startGame(selectedMode, 0);
                            setScreen("board");
                        } else if (selectedMode === GameMode.AIVAI) {
                            setScreen("select-ai");
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
            {screen === "select-ai" && (
                <SelectAiMatch
                    onBack={() => setScreen("select-mode")}
                    onStartGame={(xAi, oAi) => {
                        startGame(GameMode.AIVAI, 0, [xAi, oAi]);
                        setScreen("board");
                    }}
                />
            )}
            {screen === "board" && (
                <div className="flex flex-col items-center gap-4 py-4 lg:flex-row lg:items-start lg:justify-center">
                    <UltimateBoard />
                    <div className="flex w-full max-w-163 flex-col gap-2 p-2 lg:h-163 lg:w-80 lg:max-w-none">
                        <GameStatus />
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
