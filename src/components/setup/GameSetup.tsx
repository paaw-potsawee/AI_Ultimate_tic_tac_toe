import { useState } from "react";
import type { Player } from "../../types/game";
import {
    GameMode,
    gameModeOptions,
    parseGameMode,
    type GameModeValue,
} from "../../types/gameMode";
import { useGameConfigStore } from "../../store/boardStore";

interface Props {
    onStartGame: () => void;
}

const GameSetup = ({ onStartGame }: Props) => {
    const { mode, humanPlayer, startGame } = useGameConfigStore();
    const [draftMode, setDraftMode] = useState<GameModeValue>(mode);
    const [draftHumanPlayer, setDraftHumanPlayer] =
        useState<Player>(humanPlayer);

    const handleStartGame = () => {
        startGame(draftMode, draftHumanPlayer);
        onStartGame();
    };

    return (
        <main className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6">
            <section className="flex flex-col gap-4 border-2 border-black bg-peach p-6">
                <h2>Set up your game</h2>
                <label className="flex flex-col gap-2">
                    <span>Game mode</span>
                    <select
                        value={draftMode}
                        onChange={(event) =>
                            setDraftMode(parseGameMode(event.target.value))
                        }
                    >
                        {gameModeOptions.map(({ value, label }) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </label>

                {draftMode !== GameMode.PVP && (
                    <fieldset className="flex flex-col gap-2">
                        <legend>Play as</legend>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                className={`border-2 border-black px-4 py-2 ${draftHumanPlayer === 0 ? "bg-teal" : "bg-white"}`}
                                onClick={() => setDraftHumanPlayer(0)}
                            >
                                X
                            </button>
                            <button
                                type="button"
                                className={`border-2 border-black px-4 py-2 ${draftHumanPlayer === 1 ? "bg-teal" : "bg-white"}`}
                                onClick={() => setDraftHumanPlayer(1)}
                            >
                                O
                            </button>
                        </div>
                    </fieldset>
                )}

                <button
                    type="button"
                    className="border-2 border-black bg-orange px-4 py-2 font-bold"
                    onClick={handleStartGame}
                >
                    Start Game
                </button>
            </section>
        </main>
    );
};

export default GameSetup;
