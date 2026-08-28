import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import type { ComponentPropsWithoutRef } from "react";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
    className?: string;
};

const Button = ({
    className,
    children,
    type = "button",
    ...props
}: ButtonProps) => {
    return (
        <button
            type={type}
            className={twMerge(
                clsx(
                    "border-2 rounded-2xl border-black px-4 py-2 font-bold",
                    className,
                ),
            )}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
