<script lang="ts" setup>
	import { computed } from "vue";
	import { useBoardStore } from "../stores/board.store";
	import { useDeckStore } from "../stores/deck.store";
	import { useDraggableStore } from "../stores/draggable.store";
	import { useGridStore } from "../stores/grid.store";


	const gridStore = useGridStore();
	const deck = useDeckStore();
	const draggable = useDraggableStore();
	const board = useBoardStore();

	const canPlace = computed(() => {
		if (
			draggable.dragged === null
			|| deck.active === null
			|| board.hoveredCell === null
		) {
			return false;
		}
		return gridStore.canPlace(
			deck.active,
			board.hoveredCell
		);
	})
</script>

<template>
	<div
		:class="{
			'is-dragging': draggable.dragged !== null,
			'can-place': canPlace,
		}"
		class="hovered"
	></div>
</template>

<style scoped>
	.hovered {
		display: none;

		:global(:hover) > &,
		&.is-dragging {
			display: revert;
			grid-area: v-bind('board.visuallyHoveredCell.y') / v-bind('board.visuallyHoveredCell.x');
			pointer-events: none;
			outline: solid 2px rgba(90, 230, 90, 0.17);
			outline-offset: 1px;
		}

		&.can-place {
			animation: --pulse ease-in-out 500ms infinite;
		}
	}

	@keyframes --pulse {
		50% {
			scale: 1.05;
		}
	}
</style>