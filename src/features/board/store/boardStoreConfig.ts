import type { Player } from "../types/game";
import type { GameModeValue } from "@/types/gameMode";
import { optionListeners, store } from "./boardStoreState";

export const setMode = (mode: GameModeValue): void => {
    if (store.option === mode) return;
    store.option = mode;
    optionListeners.forEach((listener) => listener());
};

export const setHumanPlayer = (player: Player): void => {
    if (store.humanPlayer === player) return;
    store.humanPlayer = player;
    optionListeners.forEach((listener) => listener());
};
