<script setup lang="ts">
	import { computed } from "vue";
	import { addVec } from "../helpers/vector.helper";
	import { useBoardStore } from "../stores/board.store";
	import type { GridVec } from "../stores/grid.store";
	import { useGridStore } from "../stores/grid.store";
	import DualCell from "./dual-cell.vue";
	import { gap, tileHeight, tileWidth } from "./grid.config";

	const grid = useGridStore();
	const board = useBoardStore();

	function px(value: number): string {
		return `${ value.toString(10) }px`;
	}

	const offsetX = gap + tileWidth / 2;
	const offsetY = gap + tileHeight / 2;

	const dualOffsets = [
		{x: 0, y: 0},
		{x: -1, y: 0},
		{x: 0, y: -1},
		{x: -1, y: -1},
	] as GridVec[];

	export type DualTile = {
		x: number,
		y: number,
		style: string,
	}

	const filledDualTiles = computed<DualTile[]>(() => {
		const cells = []
		for (let x = 1; x < board.visibleGridSize.width + 1; x++) {
			const mapX = x + board.gridWindow.x - 1 - board.halfSize.width;
			const nbCellsAtXLeft = grid.cells.get(mapX - 1)?.size ?? 0;
			const nbCellsAtXRight = grid.cells.get(mapX)?.size ?? 0;
			if (nbCellsAtXLeft === 0 && nbCellsAtXRight === 0) {
				continue;
			}

			for (let y = 1; y < board.visibleGridSize.height + 1; y++) {
				const position = {
					x: mapX,
					y: y + board.gridWindow.y - 1 - board.halfSize.height
				} as GridVec;
				if (dualOffsets.some(offset => grid.hasCellAt(addVec(offset, position)))) {
					cells.push({
						x,
						y,
						style: `--x:${ x };--y:${ y }`
					} as DualTile);
				}
			}
		}
		return cells;
	})

	const gridOffsetX = computed(() => px(board.visibleGridOffset.x - offsetX));
	const gridOffsetY = computed(() => px(board.visibleGridOffset.y - offsetY));
	const width = computed(() => board.visibleGridSize.width + 2);
	const height = computed(() => board.visibleGridSize.height + 2);
</script>

<template>
	<div class="dual-grid">
		<dual-cell
			v-for="tile in filledDualTiles"
			:key="tile.style"
			:tile
		/>
	</div>
</template>

<style scoped>
	.dual-grid {
		--gap: v-bind('px(gap)');
		--tileWidth: v-bind('px(tileWidth+gap)');
		--tileHeight: v-bind('px(tileHeight+gap)');

		display: grid;
		grid: repeat(v-bind(height), var(--tileHeight)) / repeat(v-bind(width), var(--tileWidth));

		height: calc(v-bind(height) * (var(--tileHeight)));
		width: calc(v-bind(width) * (var(--tileWidth)));
		transform: translateX(v-bind(gridOffsetX)) translateY(v-bind(gridOffsetY));

		pointer-events: none;

		image-rendering: pixelated;
		background-image: url("../assets/textures/dirt/dirt.png");
		background-size: 110px;

	}
</style>