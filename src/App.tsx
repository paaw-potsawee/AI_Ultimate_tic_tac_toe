import { useState } from "react";
import UltimateBoard from "./components/board/UltimateBoard";
import GameStatus from "./components/board/GameStatus";
import PlayerInfo from "./components/board/PlayerInfo";
import GameControls from "./components/board/GameControls";
import MoveHistory from "./components/board/MoveHistory";
import Header from "./components/header/Header";
import GameSetup from "./components/setup/GameSetup";

function App() {
    const [screen, setScreen] = useState<"setup" | "board">("setup");

    return (
        <>
            <Header />
            {screen === "setup" ? (
                <GameSetup onStartGame={() => setScreen("board")} />
            ) : (
                <div className="flex flex-col items-center">
                    <GameStatus />
                    <UltimateBoard />
                    <PlayerInfo />
                    <div className="flex gap-2 my-2">
                        <GameControls onBackToSetup={() => setScreen("setup")} />
                    </div>
                    <MoveHistory />
                </div>
            )}
        </>
    );
}

export default App;
