import emitter from "mitt";
import type { CardInstance } from "./plugins/deck/card.helper";
import type { GridVec } from "./plugins/grid/grid.store";

export type AppEvents = {
	placed: { card: CardInstance, at: GridVec },
}

export const bus = emitter<AppEvents>();