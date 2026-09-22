import { useState } from "react";
import { aiModeOptions, GameMode, type AiModeValue } from "@/types/gameMode";

interface Props {
    onBack: () => void;
    onStartGame: (xAi: AiModeValue, oAi: AiModeValue) => void;
}

interface PlayerSelectorProps {
    player: "X" | "O";
    value: AiModeValue;
    onChange: (value: AiModeValue) => void;
}

const PLAYER_STYLES = {
    X: {
        accent: "text-sunset-600",
        selected: "border-black bg-ocean-200 shadow-[4px_4px_0_#bb3e03]",
        marker: "bg-ocean-200 text-sunset-600",
    },
    O: {
        accent: "text-teal",
        selected: "border-black bg-ocean-200 shadow-[4px_4px_0_#24a7a1]",
        marker: "bg-ocean-200 text-teal",
    },
} as const;

const PlayerSelector = ({ player, value, onChange }: PlayerSelectorProps) => {
    const styles = PLAYER_STYLES[player];

    return (
        <fieldset className="relative min-w-0 rounded-2xl border-4 border-black bg-orange p-4 shadow-md sm:p-6">
            <legend className="sr-only">
                Choose the AI for player {player}
            </legend>
            <div className="mb-5 flex items-center justify-center gap-4">
                <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-black text-3xl font-black italic ${styles.marker}`}
                    aria-hidden="true"
                >
                    {player}
                </div>
                <div>
                    <p className="text-xs font-bold tracking-[0.18em] text-black/55 uppercase">
                        Player {player}
                    </p>
                    <h2
                        className={`text-2xl font-bold italic ${styles.accent}`}
                    >
                        Choose an AI
                    </h2>
                </div>
            </div>

            <div className="grid gap-3">
                {aiModeOptions.map((option) => {
                    const isSelected = value === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            aria-label={`Use ${option.shortLabel} for player ${player}`}
                            aria-pressed={isSelected}
                            onClick={() => onChange(option.value)}
                            className={`group flex min-h-17 w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all duration-200 focus-visible:ring-4 focus-visible:ring-white/80 focus-visible:outline-none sm:px-4 ${
                                isSelected
                                    ? styles.selected
                                    : "border-black bg-peach hover:-translate-y-0.5 hover:brightness-105"
                            }`}
                        >
                            <span
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-black text-2xl font-black transition-transform group-hover:rotate-3 ${
                                    isSelected
                                        ? styles.marker
                                        : "bg-orange text-black"
                                }`}
                                aria-hidden="true"
                            >
                                {option.glyph}
                            </span>
                            <span className="min-w-0 flex-1 text-lg font-bold text-black italic">
                                {option.label}
                            </span>
                            <span
                                className={`h-5 w-5 shrink-0 rounded-full border-2 border-black p-0.5 ${
                                    isSelected ? "bg-black" : "bg-white/60"
                                }`}
                                aria-hidden="true"
                            >
                                {isSelected && (
                                    <span className="block h-full w-full rounded-full bg-white" />
                                )}
                            </span>
                        </button>
                    );
                })}
            </div>
        </fieldset>
    );
};

const SelectAiMatch = ({ onBack, onStartGame }: Props) => {
    const [xAi, setXAi] = useState<AiModeValue>(GameMode.HEURISTIC_AI);
    const [oAi, setOAi] = useState<AiModeValue>(GameMode.BLIND_BFS_AI);

    return (
        <main className="relative flex w-full flex-1 items-center justify-center overflow-hidden bg-teal px-4 py-8 sm:px-6 lg:px-10">
            <div
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)",
                    backgroundSize: "16px 16px",
                }}
            />
            <h1 className="sr-only">Choose AI players</h1>

            <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-6">
                <div>
                    <button
                        type="button"
                        onClick={onBack}
                        className="rounded-2xl border-2 border-black bg-ocean-200 px-4 py-2 font-bold text-black shadow-md transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:ring-4 focus-visible:ring-white focus-visible:outline-none"
                    >
                        ← Back
                    </button>
                </div>

                <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
                    <PlayerSelector player="X" value={xAi} onChange={setXAi} />

                    <div className="mx-auto flex h-17 w-17 items-center justify-center rounded-full border-4 border-black bg-peach text-xl font-black text-black italic shadow-md lg:h-20 lg:w-20 lg:text-2xl">
                        VS
                    </div>

                    <PlayerSelector player="O" value={oAi} onChange={setOAi} />
                </div>

                <div className="flex flex-col items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onStartGame(xAi, oAi)}
                        className="group min-w-60 rounded-2xl border-4 border-black bg-orange px-8 py-3 text-xl font-bold text-sunset-600 italic shadow-md transition-all hover:-translate-y-0.5 hover:brightness-105 focus-visible:ring-4 focus-visible:ring-white focus-visible:outline-none active:translate-y-0"
                    >
                        Start Game
                        <span className="ml-3 inline-block transition-transform group-hover:translate-x-1">
                            →
                        </span>
                    </button>
                    <p className="text-xs font-bold tracking-wide text-black/55 uppercase">
                        X always makes the first move
                    </p>
                </div>
            </div>
        </main>
    );
};

export default SelectAiMatch;
