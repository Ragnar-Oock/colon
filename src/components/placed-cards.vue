<script lang="ts" setup>
	import { computed } from "vue";
	import type { FilledCell } from "../domains/cell/cell";
	import { useBoardStore } from "../stores/board.store";
	import { useGridStore } from "../stores/grid.store";
	import GridCell from "./grid-cell.vue";

	const grid = useGridStore();
	const board = useBoardStore();

	const visibleCells = computed<FilledCell[]>(() => {
		const cells = []
		for (let x = 0; x < board.visibleGridSize.width; x++) {
			const mapX = x + board.gridWindow.x - 1 - board.halfSize.width;
			const nbCellsAtX = grid.cells.get(mapX)?.size ?? 0
			if (nbCellsAtX === 0) {
				continue;
			}

			for (let y = 0; y < board.visibleGridSize.height; y++) {
				const cell = grid.getCell(
					mapX,
					y + board.gridWindow.y - 1 - board.halfSize.height,
				);
				if (cell) {
					cells.push(cell);
				}
			}
		}
		return cells;
	})

</script>

<template>
	<div class="placed-cards d-content">
		<GridCell v-for="cell in visibleCells" :key="cell.card.id" :cell></GridCell>
	</div>
</template>
