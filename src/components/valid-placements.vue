<script lang="ts" setup>
	import { computed } from "vue";
	import { isEmpty } from "../domains/cell/cell";
	import { useMapCellPosition } from "../domains/cell/cell-position.composable";
	import { iter } from "../helpers/iterator.helper";
	import { useBoardStore } from "../stores/board.store";
	import { useDeckStore } from "../stores/deck.store";
	import { useDraggableStore } from "../stores/draggable.store";
	import type { GridVec } from "../stores/grid.store";
	import { useGridStore } from "../stores/grid.store";

	const board = useBoardStore();
	const grid = useGridStore();
	const draggable = useDraggableStore();
	const deck = useDeckStore();

	const visibleCells = computed(() => {
		const active = deck.active;
		if (active === undefined) {
			return iter(0);
		}
		return iter()
			.drop(1)
			.take(board.visibleGridSize.height)
			.flatMap(y =>
				iter()
					.drop(1)
					.take(board.visibleGridSize.width)
					.map(x => {
						const position = useMapCellPosition({x, y} as GridVec, false);

						return ({
							card: grid.getCardAt(position),
							position,
							renderPosition: {x, y} as GridVec,
						});
					})
			)
			.filter(isEmpty)
			.filter(({position}) => grid.canPlace(active, position));
	})

	const isVisible = computed(() => draggable.dragged !== null)
</script>

<template>
	<div v-if="isVisible" class="valid-placements d-content">
		<div
			v-for="({renderPosition: {x, y}}) in visibleCells"
			:style="{'--x': x, '--y': y}"
			class="valid-placement"
		/>
	</div>
</template>

<style scoped>
	.valid-placement {
		background-color: oklch(0.726 0.182 154.097 / 0.14);
		grid-area: var(--y, 1) / var(--x, 1);
		user-select: none;
	}
</style>