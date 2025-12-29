import { computed, ComputedRef, MaybeRefOrGetter, readonly, toValue } from "vue";
import { GridVec, useGridStore } from "../stores/grid.store";
import { equalsVec } from "./vector.helper";

export type ScoreContribution = {
	score: number;
	bonus: number;
}

const noContribution = readonly<ScoreContribution>({
	score: 0,
	bonus: 0,
})

export function useScoreContribution(at: MaybeRefOrGetter<GridVec>): ComputedRef<ScoreContribution> {
	const grid = useGridStore();

	return computed(() => {
		const position = toValue(at);

		return grid
				.scoreContributors
				?.find((cell) => equalsVec(position, cell.position))
			?? noContribution;
	})
}