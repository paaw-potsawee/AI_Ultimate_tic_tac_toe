import { cn } from "@/lib/cn";

interface Props {
    className?: string;
}

const O = ({ className }: Props) => {
    return (
        <svg
            viewBox="0 0 40 40"
            className={cn("h-3/4 w-3/4", className)}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="20" cy="20" r="18" stroke="#24a7a1" strokeWidth="2.5" />
        </svg>
    );
};

export default O;
