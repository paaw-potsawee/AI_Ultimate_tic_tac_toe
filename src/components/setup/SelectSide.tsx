import type { Player } from "@/features/board";
import { Button } from "@/components/ui";

interface Props {
    onStartGame: (side: Player) => void;
}

const SelectSide = ({ onStartGame }: Props) => {
    return (
        <main className="flex w-full flex-1 items-center justify-center px-4 py-8 sm:p-6">
            <section className="flex w-full max-w-md flex-col items-center gap-6 rounded-xl border-2 border-black bg-orange p-6 shadow-md sm:p-10">
                <h2 className="text-center text-2xl italic sm:text-3xl">
                    Choose Your Player
                </h2>
                <div className="flex w-full justify-center gap-8 sm:gap-16">
                    <Button
                        className="h-16 w-16 bg-ocean-200 text-2xl font-bold text-sunset-600 transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:ring-4 focus-visible:ring-white focus-visible:outline-none"
                        onClick={() => onStartGame(0)}
                    >
                        X
                    </Button>
                    <Button
                        className="h-16 w-16 bg-ocean-200 text-2xl font-bold text-teal transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:ring-4 focus-visible:ring-white focus-visible:outline-none"
                        onClick={() => onStartGame(1)}
                    >
                        O
                    </Button>
                </div>
            </section>
        </main>
    );
};

export default SelectSide;
