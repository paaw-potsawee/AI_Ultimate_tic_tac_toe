export const GameMode = {
    PVP: 0,
    HEURISTIC_AI: 1,
    BLIND_DFS_AI: 2,
    BLIND_BFS_AI: 3,
    AIVAI: 4,
} as const;

export type GameModeValue = (typeof GameMode)[keyof typeof GameMode];

export const gameModeOptions = [
    {
        value: GameMode.PVP,
        label: "Player",
    },
    {
        value: GameMode.HEURISTIC_AI,
        label: "The Heuristic",
    },
    {
        value: GameMode.BLIND_DFS_AI,
        label: "The Blind (DFS)",
    },
    {
        value: GameMode.BLIND_BFS_AI,
        label: "The Blind (BFS)",
    },
    {
        value: GameMode.AIVAI,
        label: "AI vs AI",
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
        mode === GameMode.BLIND_DFS_AI ||
        mode === GameMode.BLIND_BFS_AI ||
        mode === GameMode.AIVAI
    ) {
        return mode;
    }

    return GameMode.PVP;
};
