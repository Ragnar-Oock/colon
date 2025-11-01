<script setup lang="ts">
import { useElementBounding, useMouse } from "@vueuse/core";
import { computed, useTemplateRef, watchEffect } from "vue";
import { useDeckStore } from "../stores/deck.store";
import { FilledCell, useGridStore } from "../stores/grid.store";
import GridCell from "./grid-cell.vue";


const gridStore = useGridStore();
const deckStore = useDeckStore();

const grid = useTemplateRef<HTMLDivElement>('grid');
const {top, left} = useElementBounding(grid);
const {x, y} = useMouse({
	type: event => event instanceof MouseEvent
			? [event.clientX - left.value, event.clientY - top.value]
			: null,
	target: grid
})

const tileHeight = 100,
		tileWidth = 100,
		gap = 10;

const hoveredCell = computed(() => ({
	x: Math.trunc((x.value + (.5 * gap)) / (tileWidth + gap)) + 1,
	y: Math.trunc((y.value + (.5 * gap)) / (tileHeight + gap)) + 1,
}))

function interactCell() {
	const cell = gridStore.getCellAt(hoveredCell.value);
	if (!(cell.card === undefined && deckStore.active !== null)) {
		return;
	}

	cell.card = deckStore.active;
	deckStore.remove(cell.card);
	gridStore.setCell(cell);
}
const visibleFilledCells = computed(() => gridStore.cells as FilledCell[]);

const minHeight = computed(() => {
	const tileNumberY = gridStore.bounds.bottom - gridStore.bounds.top;
	console.log(tileNumberY)
	return `${tileNumberY * tileHeight + (tileNumberY - 1) * gap}px`;
});
const minWidth = computed(() => {
	const tileNumberX = gridStore.bounds.right - gridStore.bounds.left;
	console.log(tileNumberX)
	return `${tileNumberX * tileWidth + (tileNumberX - 1) * gap}px`;
});
</script>

<template>
<div class="map" ref="grid" @click="interactCell">
	<div class="hovered"></div>
	<GridCell v-for="cell in visibleFilledCells" :key="cell.id" :cell></GridCell>
</div>
</template>

<style scoped>
.map	{
	display: grid;
	grid: repeat(auto-fill, v-bind('tileWidth+"px"')) / repeat(auto-fill, v-bind('tileHeight+"px"'));
	gap: v-bind('gap+"px"');

	min-height: v-bind(minHeight);
	min-width: v-bind(minWidth);
}

.hovered {
	grid-area: v-bind('hoveredCell.y') / v-bind('hoveredCell.x');
	pointer-events: none;
	outline: solid 2px rgba(90, 230, 90, 0.17);
	outline-offset: 1px;
	animation: --pulse ease-in-out 500ms infinite;

}
@keyframes --pulse {
	50% {
		scale: 1.05;
	}
}
</style>