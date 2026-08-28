import { useState } from "react";
import type { Player } from "../../types/game";

interface Props {
    initialPlayer: Player;
    onBack: () => void;
    onStartGame: (side: Player) => void;
}

const SelectSide = ({ initialPlayer, onBack, onStartGame }: Props) => {
    const [draftHumanPlayer, setDraftHumanPlayer] =
        useState<Player>(initialPlayer);

    return (
        <main className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6">
            <section className="flex flex-col gap-4 border-2 border-black bg-peach p-6">
                <h2>Choose Your Side</h2>
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

                <div className="mt-2 flex gap-4">
                    <button
                        type="button"
                        className="flex-1 border-2 border-black bg-white px-4 py-2 font-bold"
                        onClick={onBack}
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        className="flex-1 border-2 border-black bg-orange px-4 py-2 font-bold"
                        onClick={() => onStartGame(draftHumanPlayer)}
                    >
                        Start Game
                    </button>
                </div>
            </section>
        </main>
    );
};

export default SelectSide;

