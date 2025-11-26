<script lang="ts" setup>
	import { useScoreContribution } from "../helpers/useScoreContribution";
	import { FilledCell, GridVec } from "../stores/grid.store";
	import PlacementScore from "./placement-score.vue";

	const {
		cell
	} = defineProps<{
		cell: FilledCell & { visiblePosition: GridVec }
	}>();

	const contribution = useScoreContribution(cell.position);

</script>

<template>
	<div class="board-card">
		<PlacementScore :bonus="contribution.bonus" :score="contribution.score"/>
		<div class="icon">{{ cell.card?.icon }}</div>
		<!--				<span
							v-if="cell.card?.trigger !== undefined"
							class="trigger"
							title="trigger harvest on :"
						>{{ cell.card?.trigger }}</span>-->
	</div>
</template>

<style scoped>
	.board-card {
		grid-area: v-bind('cell.visiblePosition.y') / v-bind('cell.visiblePosition.x');
		position: relative;
		user-select: none;

		.icon {
			font-size: 5em;
			pointer-events: none;
		}

		/*.trigger {
			position: absolute;
			top: 0;
			left: 0;
			min-width: 3ch;
			height: 3ch;
			text-align: center;

			background: #2c3e50;
			border-radius: 100%;
		}*/

	}
</style>