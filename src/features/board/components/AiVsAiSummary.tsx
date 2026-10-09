import { useBoardStore, useGameConfigStore } from "../store/boardStore";
import { GameMode, getAiModeOption } from "@/types/gameMode";

const AiVsAiSummary = () => {
    const { winner, aiStatsSnapshot } = useBoardStore();
    const { mode, aiPlayers } = useGameConfigStore();

    if (mode !== GameMode.AIVAI || winner === null) return null;

    const rows = ([0, 1] as const).map((player) => {
        const label = getAiModeOption(aiPlayers[player]).shortLabel;
        const stats = aiStatsSnapshot[player];
        const avgMs = stats.turns > 0 ? stats.totalMs / stats.turns : 0;
        const avgNodes = stats.turns > 0 ? stats.totalNodes / stats.turns : 0;
        return { player, label, avgMs, avgNodes };
    });

    return (
        <div className="border-3 border-black bg-white p-3">
            <div className="mb-2 text-xs font-black tracking-[0.18em] uppercase">
                Search Performance
            </div>
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-[10px] font-black tracking-wide text-black/50 uppercase">
                        <th className="pb-1 text-left font-black">Engine</th>
                        <th className="pb-1 text-right font-black">
                            Avg ms / turn
                        </th>
                        <th className="pb-1 text-right font-black">
                            Nodes explored
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(({ player, label, avgMs, avgNodes }) => (
                        <tr
                            key={player}
                            className={`font-bold ${
                                player === 0
                                    ? "text-sunset-900"
                                    : "text-ocean-700"
                            }`}
                        >
                            <td className="py-1">
                                {player === 0 ? "X" : "O"} · {label}
                            </td>
                            <td className="py-1 text-right tabular-nums">
                                {avgMs.toFixed(0)} ms
                            </td>
                            <td className="py-1 text-right tabular-nums">
                                {Math.round(avgNodes).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-1 text-[10px] font-bold tracking-wide text-black/40 uppercase">
                Nodes explored = states visited per turn, not memory
            </div>
        </div>
    );
};

export default AiVsAiSummary;
