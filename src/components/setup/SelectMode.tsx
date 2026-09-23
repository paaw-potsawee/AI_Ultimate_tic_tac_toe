import { gameModeOptions, type GameModeValue } from "@/types/gameMode";

interface Props {
    onNext: (mode: GameModeValue) => void;
}

const SelectMode = ({ onNext }: Props) => {
    return (
        <main className="flex w-full flex-1 flex-col bg-teal md:flex-row">
            <div
                className="relative flex w-full shrink-0 flex-col items-center justify-between border-b-[5px] border-black bg-peach px-3 py-7 md:w-[min(41vw,26.25rem)] md:border-r-[5px] md:border-b-0 md:px-2 md:py-10 lg:py-12"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)",
                    backgroundSize: "16px 16px",
                }}
            >
                <div className="mb-5 flex w-full justify-center sm:mb-6 md:mb-8 lg:mb-10">
                    <span
                        className="block max-w-full text-center font-sans text-5xl leading-tight font-extrabold tracking-tight italic filter-[drop-shadow(0px_2px_0px_#000000)_drop-shadow(0px_-1px_0px_#000000)_drop-shadow(1.5px_0px_0px_#000000)_drop-shadow(-1.5px_0px_0px_#000000)] sm:text-6xl md:text-[clamp(3.5rem,7.5vw,5rem)] md:leading-tight"
                        style={{
                            background:
                                "linear-gradient(135.11deg, #EFBF04 25.65%, #896D02 74.35%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Ultimate
                    </span>
                </div>

                {/* Tic Tac Toe */}
                <div className="flex w-full flex-row justify-center md:flex-col text-center font-sans text-6xl leading-[0.88] font-extrabold tracking-tight text-black italic sm:text-7xl md:text-[clamp(6rem,14vw,11.25rem)] md:leading-[0.9] ">
                    <span>Tic</span>
                    <span>Tac</span>
                    <span>Toe</span>
                </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-4 px-4 py-8 sm:gap-5 sm:py-10 md:items-start md:gap-6 md:px-0 lg:gap-8">
                {gameModeOptions.map(({ value, label }) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => onNext(value)}
                        className="flex min-h-14 w-full max-w-xl items-center justify-center border-4 border-black bg-orange px-3 py-3 text-center font-sans text-xl leading-tight font-medium text-sunset-600 italic shadow-md transition-all hover:brightness-114 sm:min-h-16 sm:px-6 sm:text-2xl md:max-w-[34rem] md:rounded-r-2xl md:border-l-0 md:px-8 md:text-3xl xl:text-[40px]"
                    >
                        {label}
                    </button>
                ))}
            </div>
        </main>
    );
};

export default SelectMode;
