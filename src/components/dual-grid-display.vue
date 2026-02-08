<script setup lang="ts">
	import { computed } from "vue";
	import { addVec } from "../helpers/vector.helper";
	import { useBoardStore } from "../stores/board.store";
	import type { GridVec } from "../stores/grid.store";
	import { useGridStore } from "../stores/grid.store";
	import { gap, tileHeight, tileWidth } from "./grid.config";

	const grid = useGridStore();
	const board = useBoardStore();

	function px(value: number): string {
		return `${ value.toString(10) }px`;
	}

	const offsetX = (tileWidth + gap) / 2;
	const offsetY = (tileHeight + gap) / 2;

	const dualOffsets = [
		{x: 0, y: 0},
		{x: -1, y: 0},
		{x: 0, y: -1},
		{x: -1, y: -1},
	] as GridVec[];

	type DualTile = {
		x: number,
		y: number,
		style: string,
	}

	const filledDualTiles = computed<DualTile[]>(() => {
		const cells = []
		for (let x = 0; x < board.visibleGridSize.width; x++) {
			const mapX = x + board.gridWindow.x - 1 - board.halfSize.width;
			const nbCellsAtXLeft = grid.cells.get(mapX - 1)?.size ?? 0;
			const nbCellsAtXRight = grid.cells.get(mapX)?.size ?? 0;
			if (nbCellsAtXLeft === 0 && nbCellsAtXRight === 0) {
				continue;
			}

			for (let y = 0; y < board.visibleGridSize.height; y++) {
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
		<div
			class="background" v-for="(background, index) in filledDualTiles"
			:key="background.style"
			:style="background.style"
		>{{ background.x }} {{ background.y }}
		</div>
	</div>
</template>

<style scoped>
	.dual-grid {
		--tileWidth: v-bind('px(tileWidth+gap)');
		--tileHeight: v-bind('px(tileHeight+gap)');

		display: grid;
		grid: repeat(v-bind(height), var(--tileHeight)) / repeat(v-bind(width), var(--tileWidth));

		height: calc(v-bind(height) * (var(--tileHeight)));
		width: calc(v-bind(width) * (var(--tileWidth)));
		transform: translateX(v-bind(gridOffsetX)) translateY(v-bind(gridOffsetY));

		pointer-events: none;

		.background {
			grid-area: var(--y) / var(--x);

			outline: 1px solid white;
		}
	}
</style>