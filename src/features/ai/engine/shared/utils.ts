import type { SearchContext } from "./types";
import { SEARCH_TIMEOUT } from "./constants";

export const visitNode = (context: SearchContext): void => {
    context.nodes += 1;
    // Checking every 32 nodes keeps the deadline tight without paying for a
    // performance.now() call at every node.
    if ((context.nodes & 31) === 0) enforceDeadline(context);
};

export const enforceDeadline = (context: SearchContext): void => {
    if (performance.now() >= context.deadline) throw SEARCH_TIMEOUT;
};
