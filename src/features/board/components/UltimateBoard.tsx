import LocalBoard from "./LocalBoard";
import WinningSlash from "./WinningSlash";
import { useBoardStore } from "../store/boardStore";
import { cn } from "@/lib/cn";

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
    const { board, gameWinningLine, review, exitReview } = useBoardStore();
    // While reviewing a past move, the board shows that position read-only.
    const shownBoard = review ? review.board : board;
    const shownWinningLine = review ? review.gameWinningLine : gameWinningLine;

    return (
        <section
            aria-label={
                review
                    ? `Ultimate tic-tac-toe board after move ${review.moveNumber}`
                    : "Ultimate tic-tac-toe board"
            }
            className={cn(
                "relative w-[min(100%,40.75rem,calc(100dvh-8.5rem))] shrink-0 justify-self-center border-4 bg-orange p-1 transition-colors sm:p-2",
                // Reserve room inside the frame for the review banner so it
                // never overlaps the cells or the panels below the board.
                review ? "border-burgundy pb-12" : "border-black",
            )}
        >
            {/* The grid lines are drawn relative to the board grid, not the frame. */}
            <div className="relative">
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
                    {shownBoard.map((rowBoards, row) =>
                        rowBoards.map((_, col) => (
                            <LocalBoard
                                key={`${row}-${col}`}
                                localRow={row}
                                localCol={col}
                            />
                        )),
                    )}
                </div>

                {shownWinningLine && (
                    <WinningSlash
                        line={shownWinningLine.line}
                        strokeWidth={8}
                        strokeColor="#000000"
                        className="z-30"
                    />
                )}
            </div>

            {review && (
                <div className="absolute bottom-1.5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 border-2 border-black bg-burgundy py-1 pr-1 pl-3 text-[11px] font-black tracking-wider text-white uppercase shadow-[3px_3px_0_#000] sm:bottom-2">
                    <span className="whitespace-nowrap">
                        Viewing move {review.moveNumber}
                    </span>
                    <button
                        type="button"
                        onClick={exitReview}
                        className="border-2 border-black bg-ocean-200 px-2 py-0.5 whitespace-nowrap text-black transition-colors hover:bg-ocean-400"
                    >
                        Back to live
                    </button>
                </div>
            )}
        </section>
    );
};

export default UltimateBoard;
