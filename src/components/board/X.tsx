import { cn } from "@/lib/cn";

interface Props {
    className?: string;
}

const X = ({ className }: Props) => {
    return (
        <svg
            viewBox="0 0 40 40"
            className={cn("h-3/4 w-3/4", className)}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <line
                x1="2"
                y1="2"
                x2="38"
                y2="38"
                stroke="#ae2012"
                strokeWidth="2.5"
                strokeLinecap="square"
            />
            <line
                x1="38"
                y1="2"
                x2="2"
                y2="38"
                stroke="#ae2012"
                strokeWidth="2.5"
                strokeLinecap="square"
            />
        </svg>
    );
};

export default X;
