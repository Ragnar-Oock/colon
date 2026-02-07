<script lang="ts" setup>
	import { usePotentialScoreContributors } from "../domains/score/potential-score-contributors.composable";
	import { toString } from "../helpers/vector.helper";
	import PlacementScore from "./placement-score.vue";

	const scoreContributors = usePotentialScoreContributors();
</script>

<template>
	<div class="placement-scores d-content">
		<placement-score
			v-for="contributor in scoreContributors"
			:key="toString(contributor.position)"
			:bonus="contributor.bonus"
			:placement="contributor.position"
			:score="contributor.score"
		/>
	</div>
</template>
