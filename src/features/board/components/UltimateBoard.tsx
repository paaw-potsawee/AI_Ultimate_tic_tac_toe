import LocalBoard from "./LocalBoard";
import WinningSlash from "./WinningSlash";
import { useBoardStore } from "../store/boardStore";

// Positions (in SVG viewBox units 0–100) of the two internal dividers.
const DIVIDERS = [33.33, 66.67] as const;

// Each divider line is broken into 3 segments so it visually clears
// the gap between the 3×3 local boards. The gap coordinates match
// the p-1/p-2 padding and gap-1/gap-2 CSS layout values.
const SEGMENTS = [
    [1, 31.5],
    [35.1, 64.9],
    [68.5, 99],
] as const;

// Pre-compute all 12 SVG line descriptors at module scope so they are
// created once and never re-calculated on re-renders.
type LineSegment = {
    key: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};

const GRID_LINES: LineSegment[] = [];

for (const divider of DIVIDERS) {
    for (const [segStart, segEnd] of SEGMENTS) {
        // Vertical lines (constant x, varying y)
        GRID_LINES.push({
            key: `v-${divider}-${segStart}`,
            x1: divider,
            y1: segStart,
            x2: divider,
            y2: segEnd,
        });
        // Horizontal lines (varying x, constant y)
        GRID_LINES.push({
            key: `h-${divider}-${segStart}`,
            x1: segStart,
            y1: divider,
            x2: segEnd,
            y2: divider,
        });
    }
}

const UltimateBoard = () => {
    const { board, gameWinningLine } = useBoardStore();

    return (
        <div className="relative shrink-0 self-start border-4 border-black bg-orange p-1 sm:p-2">
            <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {GRID_LINES.map(({ key, x1, y1, x2, y2 }) => (
                    <line
                        key={key}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#e9d8a6"
                        strokeWidth="1.5"
                    />
                ))}
            </svg>

            <div className="relative grid grid-cols-3 gap-1 sm:gap-2">
                {board.map((rowBoards, row) =>
                    rowBoards.map((_, col) => (
                        <LocalBoard
                            key={`${row}-${col}`}
                            localRow={row}
                            localCol={col}
                        />
                    )),
                )}
            </div>

            {gameWinningLine && (
                <WinningSlash
                    line={gameWinningLine.line}
                    strokeWidth={8}
                    strokeColor="#000000"
                    className="z-30"
                />
            )}
        </div>
    );
};

export default UltimateBoard;
