<script lang="ts" setup>
	import { useBoardStore } from "../stores/board.store";
	import { useGridStore } from "../stores/grid.store";
	import GridCell from "./grid-cell.vue";

	const {filterCells} = useGridStore();
	const board = useBoardStore();

	const visibleCells = filterCells(({position: {x, y}}) =>
		board.gridWindow.x - board.halfSize.width < x + 1 && x + 1 < (board.halfSize.width + board.gridWindow.x)
		&& board.gridWindow.y - board.halfSize.height < y + 1 && y + 1 < (board.halfSize.height + board.gridWindow.y)
	);

</script>

<template>
	<div class="placed-cards d-content">
		<GridCell v-for="cell in visibleCells" :key="cell.card.id" :cell></GridCell>
	</div>
</template>
