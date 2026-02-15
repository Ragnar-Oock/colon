<script setup lang="ts">
	import { computed } from "vue";
	import { useMapCellPosition } from "../domains/cell/cell-position.composable";
	import type { GridVec } from "../stores/grid.store";
	import { useGridStore } from "../stores/grid.store";
	import type { DualTile } from "./dual-grid-display.vue";

	const {tile} = defineProps<{
		tile: DualTile
	}>();

	const dualOffsets = [
		{x: -1, y: -1, name: 'top left'},
		{x: 0, y: -1, name: 'top right'},
		{x: -1, y: 0, name: 'bottom left'},
		{x: 0, y: 0, name: 'bottom right'},
	] as (GridVec & { name: string })[];

	const grid = useGridStore();
	const dualCells = computed(() =>
		dualOffsets
			.map(offset => {
				const card = grid.getCardAt(useMapCellPosition({
					x: tile.x + offset.x,
					y: tile.y + offset.y
				} as Readonly<GridVec>, false))
				return {
					card,
					offset
				}
			}))
	const texturePosition = computed(() => {
		const [tl, tr, bl, br] = dualCells.value.map(({card}) => card === undefined);
		const x = (br ? 1 : 0) + (bl ? 2 : 0) + 1;
		const y = (tr ? 1 : 0) + (tl ? 2 : 0) + 1;
		return {x, y};
	})
</script>

<template>
	<div class="cell" :style="tile.style">

	</div>
</template>

<style scoped>
	.cell {
		display: grid;
		grid:
			'. . .' 1fr
			'. . .' var(--gap)
			'. . .' 1fr
		/ 1fr var(--gap) 1fr;

		overflow: clip;
		grid-area: var(--y) / var(--x);

		--bg-offset-y: 0px;
		--bg-offset-x: 0px;
		--texture-offset-x: -3;
		--texture-offset-y: -3;
		--tile: calc(var(--gap) + var(--tileWidth));

		image-rendering: crisp-edges;
		background-image: url("../assets/textures/dirt/grass.png");
		background-size: calc(var(--tile) * 4);
		background-position: calc(v-bind('texturePosition.x') * var(--tile)) calc(v-bind('texturePosition.y') * var(--tile));
	}

</style>