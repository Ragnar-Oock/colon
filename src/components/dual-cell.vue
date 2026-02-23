<script setup lang="ts">
	import { computed } from "vue";
	import validPlacementUrl from '../assets/textures/border.png';
	import type { MaybeCard } from "../domains/card/card.type";
	import { useMapCellPosition } from "../domains/cell/cell-position.composable";
	import type { Vector2 } from "../helpers/vector.helper";
	import { useDeckStore } from "../stores/deck.store";
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
		isValidPlacement: boolean,
		index: number,
	}

	const grid = useGridStore();
	const deck = useDeckStore();
	const dualCells = computed(() =>
		dualOffsets
			.map(offset => {
				const at = {
					x: tile.x + offset.x,
					y: tile.y + offset.y
				} as Readonly<GridVec>;
				const position = useMapCellPosition(at, false);
				const card = grid.getCardAt(position)
				return {
					card,
					offset,
					index: card?.index ?? Number.POSITIVE_INFINITY,
					isValidPlacement: card === undefined && deck.active !== undefined && grid.canPlace(deck.active, position)
				}
			}) as Corners<DualCell>)
	const getTexturePosition = (matching: (cell: DualCell) => boolean): Vector2 => {
		const [tl, tr, bl, br] = dualCells.value.map(cell => !matching(cell));
		const x = (br ? 1 : 0) + (bl ? 2 : 0) + 1;
		const y = (tr ? 1 : 0) + (tl ? 2 : 0) + 1;
		return {x, y};
	}

	const textures = computed(() => {
		let visitedNames = new Set<string>();
		return dualCells
			.value
			// reverse sorting because the first painted image is the last in the list
			.toSorted((bottom, top) => top.index - bottom.index)
			.flatMap(cell => {
				const tile = getTexturePosition(({card}) => card?.tile.url === cell.card?.tile.url);
				const placement = getTexturePosition(({isValidPlacement}) => deck.active !== undefined && isValidPlacement)
				const url = cell.card?.tile.url;
				return [
					url !== undefined
						? {layer: 1, style: `url("${ url }") calc(${ tile.x } * var(--tile)) calc(${ tile.y } * var(--tile))`, url}
						: undefined,
					{
						layer: 2,
						style: `url("${ validPlacementUrl }") calc(${ placement.x } * var(--tile)) calc(${ placement.y } * var(--tile))`,
						url: validPlacementUrl
					},
				].filter(layer => layer !== undefined);
			})
			.filter(({url}) => {
				if (visitedNames.has(url)) {
					return false;
				}
				visitedNames.add(url);
				return true;
			})
			// oxlint-disable-next-line no-array-sort
			.sort(({layer: a}, {layer: b}) => b - a)
			.map(({style}) => style)
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
		--tile: calc(var(--tileWidth));

		background: v-bind(textures);
		background-size: calc(var(--tile) * 4);

	}

</style>