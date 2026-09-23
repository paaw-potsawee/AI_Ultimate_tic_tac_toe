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
        <fieldset className="relative min-w-0 rounded-2xl border-4 border-black bg-orange p-4 shadow-md sm:p-5 lg:p-6">
            <legend className="sr-only">
                Choose the AI for player {player}
            </legend>
            <div className="mb-4 flex items-center justify-center gap-3 sm:mb-5 sm:gap-4">
                <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-black text-2xl font-black italic sm:h-14 sm:w-14 sm:text-3xl ${styles.marker}`}
                    aria-hidden="true"
                >
                    {player}
                </div>
                <div>
                    <p className="text-xs font-bold tracking-[0.18em] text-black/55 uppercase">
                        Player {player}
                    </p>
                    <h2
                        className={`text-xl font-bold italic sm:text-2xl ${styles.accent}`}
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
                            className={`group flex min-h-16 w-full items-center gap-2 rounded-2xl border-2 p-2.5 text-left transition-all duration-200 focus-visible:ring-4 focus-visible:ring-white/80 focus-visible:outline-none sm:min-h-17 sm:gap-3 sm:px-3 lg:px-4 ${
                                isSelected
                                    ? styles.selected
                                    : "border-black bg-peach hover:-translate-y-0.5 hover:brightness-105"
                            }`}
                        >
                            <span
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-black text-xl font-black transition-transform group-hover:rotate-3 sm:h-11 sm:w-11 sm:text-2xl ${
                                    isSelected
                                        ? styles.marker
                                        : "bg-orange text-black"
                                }`}
                                aria-hidden="true"
                            >
                                {option.glyph}
                            </span>
                            <span className="min-w-0 flex-1 text-base leading-tight font-bold text-black italic sm:text-lg">
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
        <main className="relative flex w-full flex-1 items-center justify-center overflow-hidden bg-teal px-3 py-6 sm:px-6 sm:py-8 lg:px-10">
            <div
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)",
                    backgroundSize: "16px 16px",
                }}
            />
            <h1 className="sr-only">Choose AI players</h1>

            <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-4 sm:gap-6">
                <div>
                    <button
                        type="button"
                        onClick={onBack}
                        className="rounded-2xl border-2 border-black bg-ocean-200 px-4 py-2 font-bold text-black shadow-md transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:ring-4 focus-visible:ring-white focus-visible:outline-none"
                    >
                        ← Back
                    </button>
                </div>

                <div className="grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-3 lg:gap-6">
                    <PlayerSelector player="X" value={xAi} onChange={setXAi} />

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-4 border-black bg-peach text-lg font-black text-black italic shadow-md lg:h-20 lg:w-20 lg:text-2xl">
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
