<script lang="ts" setup>
	import { computed } from "vue";
	import { usePlacementScore } from "../domains/score/placement-score.composable";
	import { toString } from "../helpers/vector.helper";
	import { useBoardStore } from "../stores/board.store";
	import { useDeckStore } from "../stores/deck.store";
	import { useDraggableStore } from "../stores/draggable.store";
	import { useGridStore } from "../stores/grid.store";
	import PlacementScore from "./placement-score.vue";


	const gridStore = useGridStore();
	const deck = useDeckStore();
	const draggable = useDraggableStore();
	const board = useBoardStore();

	const canPlace = computed(() => {
		if (
			draggable.dragged === null
			|| deck.active === undefined
			|| board.hoveredCell === undefined
		) {
			return false;
		}
		return gridStore.canPlace(
			deck.active,
			board.hoveredCell
		);
	});

	const placementScore = usePlacementScore();
	const score = computed(() => canPlace.value ? placementScore.value : 0);
</script>

<template>
	<div
		:class="{
			'is-dragging': draggable.dragged !== null,
			'can-place': canPlace,
		}"
		class="hovered"
	></div>
	<placement-score
		v-if="score > 0"
		:key="toString(board.visuallyHoveredCell)"
		:placement="board.hoveredCell ?? undefined"
		:score
		main
	/>
</template>

<style scoped>
	.hovered {
		grid-area: v-bind('board.visuallyHoveredCell.y') / v-bind('board.visuallyHoveredCell.x');
		pointer-events: none;
		position: relative;

		&::before {
			outline: solid 2px rgba(90, 230, 90, 0.17);
			outline-offset: 1px;
			position: absolute;
			inset: 0;
		}

		&.is-dragging::before {
			content: '';
		}

		&.can-place::before {
			animation: --pulse ease-in-out 500ms infinite;
		}
	}

	:global(.map:hover) {
		& > .hovered::before {
			content: '';
		}
	}

	@keyframes --pulse {
		50% {
			scale: 1.05;
		}
	}
</style>