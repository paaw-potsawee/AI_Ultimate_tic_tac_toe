export const GameMode = {
    PVP: 0,
    HEURISTIC_AI: 1,
    BLIND_AI: 2,
} as const;

export type GameModeValue = (typeof GameMode)[keyof typeof GameMode];

export const gameModeOptions = [
    {
        value: GameMode.PVP,
        label: "Player vs Player",
    },
    {
        value: GameMode.HEURISTIC_AI,
        label: "Player vs AI (Heuristic Search)",
    },
    {
        value: GameMode.BLIND_AI,
        label: "Player vs AI (Blind Search)",
    },
] satisfies readonly {
    value: GameModeValue;
    label: string;
}[];

export const parseGameMode = (value: string): GameModeValue => {
    const mode = Number(value);

    if (
        mode === GameMode.PVP ||
        mode === GameMode.HEURISTIC_AI ||
        mode === GameMode.BLIND_AI
    ) {
        return mode;
    }

    return GameMode.PVP;
};
