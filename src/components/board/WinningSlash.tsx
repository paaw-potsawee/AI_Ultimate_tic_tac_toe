import { cn } from "@/lib/cn";
import type { WinLineType } from "@/types/winLine";

interface Props {
    line: WinLineType;
    className?: string;
    strokeColor?: string;
    strokeWidth?: number;
}

const LINE_COORDS: Record<
    WinLineType,
    { x1: string; y1: string; x2: string; y2: string }
> = {
    "row-0": { x1: "2%", y1: "16.67%", x2: "98%", y2: "16.67%" },
    "row-1": { x1: "2%", y1: "50%", x2: "98%", y2: "50%" },
    "row-2": { x1: "2%", y1: "83.33%", x2: "98%", y2: "83.33%" },
    "col-0": { x1: "16.67%", y1: "2%", x2: "16.67%", y2: "98%" },
    "col-1": { x1: "50%", y1: "2%", x2: "50%", y2: "98%" },
    "col-2": { x1: "83.33%", y1: "2%", x2: "83.33%", y2: "98%" },
    "diag-main": { x1: "2%", y1: "2%", x2: "98%", y2: "98%" },
    "diag-anti": { x1: "2%", y1: "98%", x2: "98%", y2: "2%" },
};

const WinningSlash = ({
    line,
    className = "",
    strokeColor = "#000000",
    strokeWidth = 4,
}: Props) => {
    const coords = LINE_COORDS[line];

    return (
        <svg
            className={cn(
                "pointer-events-none absolute inset-0 z-10 h-full w-full",
                className,
            )}
            xmlns="http://www.w3.org/2000/svg"
        >
            <line
                x1={coords.x1}
                y1={coords.y1}
                x2={coords.x2}
                y2={coords.y2}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
            />
        </svg>
    );
};

export default WinningSlash;
