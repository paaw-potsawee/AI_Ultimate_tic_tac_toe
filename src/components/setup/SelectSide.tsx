import type { Player } from "../../types/game";
import Button from "../ui/Button";

interface Props {
    onStartGame: (side: Player) => void;
}

const SelectSide = ({ onStartGame }: Props) => {
    return (
        <main className="flex flex-1 items-center justify-center p-6">
            <section className="flex flex-col items-center gap-6 rounded-xl border-2 border-black bg-orange p-10">
                <h2 className="italic">Chose Your Player</h2>
                <div className="flex gap-16">
                    <Button
                        className="h-14 w-14 bg-ocean-200 text-2xl font-bold text-sunset-600"
                        onClick={() => onStartGame(0)}
                    >
                        X
                    </Button>
                    <Button
                        className="h-14 w-14 bg-ocean-200 text-2xl font-bold text-teal"
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
