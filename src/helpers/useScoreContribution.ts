import { computed, ComputedRef, MaybeRefOrGetter, toValue } from "vue";
import { GridVec, useGridStore } from "../stores/grid.store";
import { equalsVec } from "./vector.helper";

export function useScoreContribution(at: MaybeRefOrGetter<GridVec>): ComputedRef<number> {
	const grid = useGridStore();

	return computed(() => {
		const position = toValue(at);

		const contribution = grid
			.scoreContributors
			?.find((cell) => equalsVec(position, cell.position))

		return contribution
			? contribution.score + contribution.bonus
			: 0;
	})
}