import { gameModeOptions, type GameModeValue } from "@/types/gameMode";

interface Props {
    onNext: (mode: GameModeValue) => void;
}

const SelectMode = ({ onNext }: Props) => {
    return (
        <main className="flex w-full flex-1 flex-col gap-0 bg-teal md:flex-row">
            <div
                className="relative flex w-full shrink-0 flex-col items-center justify-between border-b-[5px] border-black bg-peach py-8 md:w-105 md:border-r-[5px] md:border-b-0 md:py-12"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)",
                    backgroundSize: "16px 16px",
                }}
            >
                <div className="mb-6 flex w-full justify-center md:mb-10">
                    <span
                        className="block text-center font-sans text-5xl leading-tight font-extrabold tracking-tight italic filter-[drop-shadow(0px_2px_0px_#000000)_drop-shadow(0px_-1px_0px_#000000)_drop-shadow(1.5px_0px_0px_#000000)_drop-shadow(-1.5px_0px_0px_#000000)] sm:text-6xl md:text-[80px] md:leading-24.25"
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
                <div className="flex w-full flex-col text-center font-sans text-6xl leading-[0.88] font-extrabold tracking-tight text-black italic sm:text-7xl md:text-[130px] md:leading-47.5 lg:text-[160px] xl:text-[180px]">
                    <span>Tic</span>
                    <span>Tac</span>
                    <span>Toe</span>
                </div>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center gap-5 py-10 pl-0 sm:gap-6 md:items-start md:gap-8">
                {gameModeOptions.map(({ value, label }) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => onNext(value)}
                        className="flex items-center justify-center border-4 border-black bg-orange px-6 text-center font-sans text-2xl leading-none font-medium text-sunset-600 italic shadow-md transition-all hover:brightness-114 sm:h-17.5 sm:px-8 sm:text-3xl md:w-fit md:rounded-r-2xl md:border-l-0 md:px-10 md:text-[40px]"
                    >
                        {label}
                    </button>
                ))}
            </div>
        </main>
    );
};

export default SelectMode;
