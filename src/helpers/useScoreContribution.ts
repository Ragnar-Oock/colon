import { computed, ComputedRef, MaybeRefOrGetter, toValue } from "vue";
import { useDeckStore } from "../stores/deck.store";
import { GridVec, useGridStore } from "../stores/grid.store";
import { equalsVec } from "./vector.helper";

export function useScoreContribution(at: MaybeRefOrGetter<GridVec>): ComputedRef<number | null> {
	const position = toValue(at);
	const grid = useGridStore();
	const deck = useDeckStore()

	return computed(() => {
		const card = deck.active

		if (card === null) {
			return null;
		}
		return grid
				.getScoreContributors(card, position, Array.from(grid.cells).concat([{card, position}]))
				.find((cell) => equalsVec(position, cell.position))
				?.score
			?? null;
	})
}