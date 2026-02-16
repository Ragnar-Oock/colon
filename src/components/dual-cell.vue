<script setup lang="ts">
	import { computed } from "vue";
	import type { MaybeCard } from "../domains/card/card.type";
	import { useMapCellPosition } from "../domains/cell/cell-position.composable";
	import type { Vector2 } from "../helpers/vector.helper";
	import type { GridVec } from "../stores/grid.store";
	import { useGridStore } from "../stores/grid.store";
	import type { DualTile } from "./dual-grid-display.vue";

	const {tile} = defineProps<{
		tile: DualTile
	}>();

	type DualOffset = (GridVec & { name: string });
	type Corners<T> = [tl: T, tr: T, bl: T, br: T];
	const dualOffsets = [
		{x: -1, y: -1, name: 'top left'},
		{x: 0, y: -1, name: 'top right'},
		{x: -1, y: 0, name: 'bottom left'},
		{x: 0, y: 0, name: 'bottom right'},
	] as Corners<DualOffset>;

	type DualCell = {
		card: MaybeCard,
		offset: DualOffset,
	}

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
			}) as Corners<DualCell>)
	const getTexturePosition = (matching: (cell: DualCell) => boolean): Vector2 => {
		const [tl, tr, bl, br] = dualCells.value.map(matching);
		const x = (br ? 1 : 0) + (bl ? 2 : 0) + 1;
		const y = (tr ? 1 : 0) + (tl ? 2 : 0) + 1;
		return {x, y};
	}
	const emptyUrl = '/assets/textures/dirt/dirt.png'
	const textures = computed(() => {
		let visitedNames = new Set<string>();
		return dualCells
			.value
			// reverse sorting because the first painted image is the last in the list
			.toSorted((bottom, top) => (top.card?.index ?? 0) - (bottom.card?.index ?? 0))
			.filter(({card: {name} = {}}) => name === undefined || visitedNames.has(name) ? false : visitedNames.add(name))
			.map(cell => {
				const {x, y} = getTexturePosition(({card}) => card?.name !== cell.card?.name);
				const url = cell.card?.tile.url ?? emptyUrl;
				return `url("${ url }") calc(${ x } * var(--tile)) calc(${ y } * var(--tile))`;
			})
			.join(', ')
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
		background: v-bind(textures);
		background-size: calc(var(--tile) * 4);

	}

</style>