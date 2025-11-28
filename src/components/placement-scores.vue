<script lang="ts" setup>
	import { toString } from "../helpers/vector.helper";
	import { useGridStore } from "../stores/grid.store";
	import PlacementScore from "./placement-score.vue";

	const grid = useGridStore();
</script>

<template>
	<div class="placement-scores d-content">
		<placement-score
			v-for="contributor in grid.scoreContributors"
			:key="toString(contributor.position)"
			:bonus="contributor.bonus"
			:placement="contributor.position"
			:score="contributor.score"
		/>
	</div>
</template>
