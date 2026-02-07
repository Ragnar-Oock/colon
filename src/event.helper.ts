import emitter from "mitt";
import type { CardInstance } from "./domains/card/card.helper";
import type { GridVec } from "./stores/grid.store";

export type AppEvents = {
	placed: { card: CardInstance, at: GridVec, forced: boolean },
}

export const bus = emitter<AppEvents>();