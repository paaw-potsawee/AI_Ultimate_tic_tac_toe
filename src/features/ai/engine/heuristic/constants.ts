export const WIN_SCORE = 1_000_000;
export const MAX_DEPTH = 10;
export const TIME_BUDGET_MS = 900;
export const TRANSPOSITION_TABLE_LIMIT = 100_000;

export const SEARCH_TIMEOUT = Symbol("search-timeout");

// Center cell (index 4) scores highest as it intersects the most winning lines.
export const POSITION_WEIGHTS = [3, 2, 3, 2, 4, 2, 3, 2, 3] as const;

export const CAPTURED_BOARD_SCORE = 2_000;
export const MACRO_ONE_IN_LINE_SCORE = 1_000;
export const MACRO_TWO_IN_LINE_SCORE = 30_000;

export const LOCAL_ONE_IN_LINE_SCORE = 15;
export const LOCAL_TWO_IN_LINE_SCORE = 200;
export const POSITION_SCORE = 2;

export const FREE_MOVE_SCORE = 300;
