export const GameMode = {
    PVP: 0,
    HEURISTIC_AI: 1,
    BLIND_DFS_AI: 2,
    BLIND_BFS_AI: 3,
    AIVAI: 4,
} as const;

export type GameModeValue = (typeof GameMode)[keyof typeof GameMode];

export type AiModeValue =
    | typeof GameMode.HEURISTIC_AI
    | typeof GameMode.BLIND_DFS_AI
    | typeof GameMode.BLIND_BFS_AI;

export const aiModeOptions = [
    {
        value: GameMode.HEURISTIC_AI,
        label: "The Heuristic",
        shortLabel: "Heuristic",
        badge: "Strategic",
        description: "Scores the board and plans ahead with Minimax.",
        glyph: "✦",
    },
    {
        value: GameMode.BLIND_DFS_AI,
        label: "The Blind (DFS)",
        shortLabel: "Blind DFS",
        badge: "Deep search",
        description: "Follows one branch deeply before trying another.",
        glyph: "↘",
    },
    {
        value: GameMode.BLIND_BFS_AI,
        label: "The Blind (BFS)",
        shortLabel: "Blind BFS",
        badge: "Wide search",
        description: "Explores every nearby possibility layer by layer.",
        glyph: "≋",
    },
] satisfies readonly {
    value: AiModeValue;
    label: string;
    shortLabel: string;
    badge: string;
    description: string;
    glyph: string;
}[];

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

export const getAiModeOption = (value: AiModeValue) =>
    aiModeOptions.find((option) => option.value === value) ?? aiModeOptions[0];

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
