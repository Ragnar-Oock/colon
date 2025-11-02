<script setup lang="ts">
import { useElementBounding, useMouse, useMousePressed } from "@vueuse/core";
import { computed, ref, useTemplateRef, watchEffect } from "vue";
import { useDeckStore } from "../stores/deck.store";
import { FilledCell, GridVec, useGridStore, Vector2 } from "../stores/grid.store";
import GridCell from "./grid-cell.vue";

type ScreenVec = Vector2 & { __brand: 'screen vec' };


const gridStore = useGridStore();
const deck = useDeckStore();

const grid = useTemplateRef<HTMLDivElement>('grid');
const gridView = useTemplateRef<HTMLDivElement>('gridView');
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
	x: Math.trunc(((x.value - visibleGridOffset.value.x) + (.5 * gap)) / (tileWidth + gap)),
	y: Math.trunc(((y.value - visibleGridOffset.value.y) + (.5 * gap)) / (tileHeight + gap)),
} as GridVec))

function interactCell() {
	const cell = gridStore.getCellAt(hoveredCell.value);
	if (!(cell.card === undefined && deck.active !== null)) {
		return;
	}

	cell.card = deck.active;
	deck.remove(cell.card);
	gridStore.setCell(cell);
}

const visibleFilledCells = computed(() => (gridStore.cells as FilledCell[])
		.map(({card, position}): FilledCell => ({
			card,
			// position
			position: {
				x: position.x + gridWindows.value.x,
				y: position.y + gridWindows.value.y,
			} as GridVec
		})));

const {pressed} = useMousePressed({target: grid});
const {x: dx, y: dy} = useMouse({type: 'movement', target: grid});
/**
 * visible position of the grid in pixel, used for display and mapping from screen space to grid space
 */
const gridPosition = ref({x: 0, y: 0} as ScreenVec);
const gridWindows = computed(() => ({
	x: Math.trunc(gridPosition.value.x / (tileWidth + gap)),
	y: Math.trunc(gridPosition.value.y / (tileHeight + gap)),
} as GridVec))
/**
 * position of the origin of the grid in screen space
 */
const visibleGridOffset = computed(() => ({
	x: gridPosition.value.x % (tileWidth + gap) - (tileWidth + gap),
	y: gridPosition.value.y % (tileHeight + gap) - (tileWidth + gap),
} as ScreenVec))
const {width, height} = useElementBounding(gridView);
const visibleGridSize = computed(() => ({
	width: width.value % (tileWidth + gap) + 2,
	height: height.value % (tileHeight + gap) + 2,
}))

watchEffect(() => {
	if (!pressed.value) {
		return;
	}
	gridPosition.value.x += dx.value;
	gridPosition.value.y += dy.value;
})

function px(value: number): string {
	return `${ value.toString(10) }px`;
}

</script>

<template>
	<pre class="debug">
pressed: {{ pressed }}
mouse delta: {{ dx }} | {{ dy }}
hovered cell: {{ hoveredCell.x }} | {{ hoveredCell.y }}
grid position: {{ gridPosition.x }} | {{ gridPosition.y }}
visible grid position: {{ visibleGridOffset.x }} | {{ visibleGridOffset.y }}
window: {{ gridWindows.x }} | {{ gridWindows.y }}
	</pre>
	<div ref="gridView" class="map-view">
		<div ref="grid" class="map" @click="interactCell">
			<div class="hovered"></div>
			<GridCell v-for="cell in visibleFilledCells" :key="cell.id" :cell></GridCell>
		</div>
	</div>
</template>

<style scoped>
.debug {
	position: absolute;
	top: 0;
	left: 0;
	pointer-events: none;
	background-color: #181818;
	z-index: 1;
}

.map-view {
	overflow: clip;
	outline: 1px pink solid;
	height: 100vh;
	position: relative;
	margin: 200px;
}

.map {
	--tileWidth: v-bind('px(tileWidth)');
	--tileHeight: v-bind('px(tileHeight)');
	--gap: v-bind('gap');

	display: grid;
	grid: repeat(v-bind('visibleGridSize.width'), var(--tileHeight)) / repeat(v-bind('visibleGridSize.width'), var(--tileWidth));
	gap: v-bind('px(gap)');


	transform: translateX(v-bind('px(visibleGridOffset.x)')) translateY(v-bind('px(visibleGridOffset.y)'));

	height: calc(v-bind('visibleGridSize.height') * (var(--tileHeight) + var(--gap)));
	width: calc(v-bind('visibleGridSize.width') * (var(--tileWidth) + var(--gap)));
	max-width: 300%;
	--bgc1: #333;
	--bgc2: #3d3d3d;
	background-image: conic-gradient(
			at v-bind('px(tileWidth)') v-bind('px(tileHeight)'),
			var(--bgc1) 0deg, var(--bgc1) 270deg,
			var(--bgc2) 270deg, var(--bgc2) 360deg
	);
	background-size: v-bind('px(tileWidth+gap)') v-bind('px(tileHeight+gap)');
	position: absolute;
	top: 0;
	left: 0;


	&:hover > .hovered {
		grid-area: v-bind('hoveredCell.y') / v-bind('hoveredCell.x');
		pointer-events: none;
		outline: solid 2px rgba(90, 230, 90, 0.17);
		outline-offset: 1px;
		animation: --pulse ease-in-out 500ms infinite;
		display: revert;
	}

	.hovered {
		display: none;
	}
}

@keyframes --pulse {
	50% {
		scale: 1.05;
	}
}
</style>