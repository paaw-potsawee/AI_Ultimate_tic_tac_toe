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
        <div className="flex min-h-dvh w-full flex-col items-center overflow-x-hidden">
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
                    onBack={() => setScreen("select-mode")}
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
                <main className="grid w-full max-w-6xl flex-1 items-start justify-items-center gap-3 px-2 py-3 sm:px-4 sm:py-4 lg:grid-cols-[minmax(0,40.75rem)_20rem] lg:justify-center lg:gap-4">
                    <UltimateBoard />
                    <aside className="flex w-full max-w-[40.75rem] min-w-0 flex-col gap-2 lg:h-[min(40.75rem,calc(100dvh-8.5rem))] lg:max-w-none">
                        <GameStatus />
                        <PlayerInfo />
                        <GameControls
                            onBackToSetup={() => setScreen("select-mode")}
                        />
                        <MoveHistory />
                    </aside>
                </main>
            )}
        </div>
    );
}

export default App;
