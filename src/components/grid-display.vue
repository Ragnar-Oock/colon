<script setup lang="ts">
import { useMouse } from "@vueuse/core";
import { computed, useTemplateRef, watchEffect } from "vue";
import { useDeckStore } from "../stores/deck.store";
import { useGridStore } from "../stores/grid.store";

const gridStore = useGridStore();
const deckStore = useDeckStore();

const grid = useTemplateRef<HTMLDivElement>('grid');
const {x, y} = useMouse({
	type: event => event instanceof MouseEvent
			? [event.offsetX, event.offsetY]
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
	if (cell.card === undefined) {
		cell.card = deckStore.pick().create();
	}
	gridStore.setCell(cell);
}
</script>

<template>
<div class="map" ref="grid" @click="interactCell">

	<div class="hovered"></div>
</div>
</template>

<style scoped>
.map	{
	display: grid;
	grid: repeat(auto-fill, v-bind('tileWidth+"px"')) / repeat(auto-fill, v-bind('tileHeight+"px"'));
	gap: v-bind('gap+"px"');

	min-height: 1000px;
}

.hovered {
	grid-area: v-bind('hoveredCell.y') / v-bind('hoveredCell.x');
	background-color: lime;
	pointer-events: none;
}
</style>