import type { SearchContext } from "./types";
import { SEARCH_TIMEOUT } from "./constants";

export const checkDeadline = (context: SearchContext, force = false): void => {
    context.nodes += 1;
    // Checking every 64 nodes amortizes performance.now() call overhead.
    if (
        (force || (context.nodes & 63) === 0) &&
        performance.now() >= context.deadline
    ) {
        throw SEARCH_TIMEOUT;
    }
};
