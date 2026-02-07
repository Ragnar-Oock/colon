import type { ComputedRef } from "vue";
import { computed } from "vue";
import { usePotentialScoreContributors } from "./potential-score-contributors.composable";

export function usePlacementScore(): ComputedRef<number> {
	const scoreContributors = usePotentialScoreContributors();

	return computed(() =>
		scoreContributors.value
			?.reduce((total, {score, bonus}) => total + score + bonus, 1)
		?? 1
	)
}