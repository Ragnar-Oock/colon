import { computed, ComputedRef, MaybeRefOrGetter, toValue } from "vue";
import { useBoardStore } from "../stores/board.store";
import { useDeckStore } from "../stores/deck.store";
import { GridVec, useGridStore } from "../stores/grid.store";
import { equalsVec } from "./vector.helper";

export function useScoreContribution(at: MaybeRefOrGetter<GridVec>): ComputedRef<number | null> {
	const position = toValue(at);
	const grid = useGridStore();
	const deck = useDeckStore()
	const board = useBoardStore();

	return computed(() => {
		const card = deck.active
		const placement = board.hoveredCell;

		if (card === null || placement === null || !grid.canPlace(card, placement)) {
			return null;
		}
		return grid
				.getScoreContributors(card, placement, Array.from(grid.cells).concat([{card, position: placement}]))
				.find((cell) => equalsVec(position, cell.position))
				?.score
			?? null;
	})
}