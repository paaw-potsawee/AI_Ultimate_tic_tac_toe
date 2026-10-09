import { useBoardStore } from "../store/boardStore";

/**
 * Shown when the AI failed to produce a move (engine error or worker crash).
 * Without it the game would sit silently on the AI's turn with no way on.
 */
const AiErrorNotice = () => {
    const { aiError, retryAiMove, winner } = useBoardStore();

    if (aiError === null || winner !== null) return null;

    return (
        <div
            role="alert"
            className="flex items-center justify-between gap-3 border-3 border-black bg-sunset-700 px-3 py-2 text-white"
        >
            <div className="min-w-0">
                <div className="text-[11px] font-black tracking-[0.18em] uppercase">
                    AI could not move
                </div>
                <div className="truncate text-xs font-semibold" title={aiError}>
                    {aiError}
                </div>
            </div>
            <button
                type="button"
                onClick={retryAiMove}
                className="shrink-0 border-2 border-black bg-ocean-200 px-3 py-1 text-sm font-black text-black shadow-[2px_2px_0_#000] transition-colors hover:bg-ocean-400"
            >
                Retry
            </button>
        </div>
    );
};

export default AiErrorNotice;
