<script lang="ts" setup>
	import { computed } from "vue";
	import { useBoardStore } from "../stores/board.store";
	import { FilledCell, GridVec, useGridStore } from "../stores/grid.store";
	import GridCell from "./grid-cell.vue";

	const {filterCells} = useGridStore();
	const board = useBoardStore();

	const visibleCells = filterCells(({position: {x, y}}) =>
		board.gridWindow.x < x && x < (board.visibleGridSize.width + board.gridWindow.x)
		&& board.gridWindow.y < y && y < (board.visibleGridSize.height + board.gridWindow.y)
	);

	const visibleFilledCells = computed(() => (visibleCells.value as FilledCell[])
		.map(({card, position}) => ({
			card,
			position,
			visiblePosition: {
				x: position.x - board.gridWindow.x + 1,
				y: position.y - board.gridWindow.y + 1,
			} as GridVec
		})));
</script>

<template>
	<div class="placed-cards d-content">
		<GridCell v-for="cell in visibleFilledCells" :key="cell.card.id" :cell></GridCell>
	</div>
</template>
