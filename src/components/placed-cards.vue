<script lang="ts" setup>
	import { computed } from "vue";
	import { useBoardStore } from "../stores/board.store";
	import type { FilledCell, GridVec } from "../stores/grid.store";
	import { useGridStore } from "../stores/grid.store";
	import GridCell from "./grid-cell.vue";

	const {filterCells} = useGridStore();
	const board = useBoardStore();

	const halfSize = computed(() => ({
		width: Math.trunc(board.gridSize.width / 2),
		height: Math.trunc(board.gridSize.height / 2),
	}))

	const visibleCells = filterCells(({position: {x, y}}) =>
		board.gridWindow.x - halfSize.value.width < x + 1 && x + 1 < (halfSize.value.width + board.gridWindow.x)
		&& board.gridWindow.y - halfSize.value.height < y + 1 && y + 1 < (halfSize.value.height + board.gridWindow.y)
	);

	const visibleFilledCells = computed(() => (visibleCells.value as FilledCell[])
		.map(({card, position}) => ({
			card,
			position,
			visiblePosition: {
				x: position.x - board.gridWindow.x + 1 + halfSize.value.width,
				y: position.y - board.gridWindow.y + 1 + halfSize.value.height,
			} as GridVec
		})));
</script>

<template>
	<div class="placed-cards d-content">
		<GridCell v-for="cell in visibleFilledCells" :key="cell.card.id" :cell></GridCell>
	</div>
</template>
