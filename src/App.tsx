import { useState } from "react";
import UltimateBoard from "./components/board/UltimateBoard";
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
                <UltimateBoard onBackToSetup={() => setScreen("setup")} />
            )}
        </>
    );
}

export default App;
