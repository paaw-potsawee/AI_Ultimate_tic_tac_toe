import { useState } from "react";
import {
    gameModeOptions,
    parseGameMode,
    type GameModeValue,
} from "@/types/gameMode";

interface Props {
    initialMode: GameModeValue;
    onNext: (mode: GameModeValue) => void;
}

const SelectMode = ({ initialMode, onNext }: Props) => {
    const [draftMode, setDraftMode] = useState<GameModeValue>(initialMode);

    return (
        <main className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6">
            <section className="flex flex-col gap-4 border-2 border-black bg-peach p-6">
                <h2>Select Game Mode</h2>
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

                <button
                    type="button"
                    className="border-2 border-black bg-orange px-4 py-2 font-bold"
                    onClick={() => onNext(draftMode)}
                >
                    Next
                </button>
            </section>
        </main>
    );
};

export default SelectMode;
