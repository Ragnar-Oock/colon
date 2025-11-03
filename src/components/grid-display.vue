<script setup lang="ts">
import { useElementBounding, useMouse, useMousePressed } from "@vueuse/core";
import { computed, ref, useTemplateRef, watchEffect } from "vue";
import { Vector2 } from "../helpers/vector.helper";
import { useDeckStore } from "../stores/deck.store";
import { useDraggableStore } from "../stores/draggable.store";
import { Cell, FilledCell, GridVec, useGridStore } from "../stores/grid.store";
import GridCell from "./grid-cell.vue";

type ScreenVec = Vector2 & { __brand: 'screen vec' };


const gridStore = useGridStore();
const deck = useDeckStore();
const draggableStore = useDraggableStore();

const grid = useTemplateRef<HTMLDivElement>('grid');
const gridView = useTemplateRef<HTMLDivElement>('gridView');
const {top, left} = useElementBounding(grid);
const x = ref(0);
const y = ref(0);

const tileHeight = 100,
		tileWidth = 100,
		gap = 10;

const hoveredCell = computed(() => ({
	x: Math.trunc(((x.value - visibleGridOffset.value.x) + (.5 * gap)) / (tileWidth + gap)),
	y: Math.trunc(((y.value - visibleGridOffset.value.y) + (.5 * gap)) / (tileHeight + gap)),
} as GridVec))

let hasMoved = false;

const getHoveredCellPosition = () => ({
	x: hoveredCell.value.x + gridWindow.value.x - 1,
	y: hoveredCell.value.y + gridWindow.value.y - 1,
} as GridVec);

const getHoveredCell = () => gridStore.getCellAt(getHoveredCellPosition());

function setTile() {
	if (deck.active === null) {
		return;
	}
	if (gridStore.place(deck.active, getHoveredCellPosition())) {
		deck.remove(deck.active);
	}
}

function interactCell() {
	if (hasMoved) {
		hasMoved = false;
		return;
	}
	setTile();
}

const filteredCells = gridStore.filterCells(({position: {x, y}}) =>
		gridWindow.value.x < x && x < visibleGridSize.value.width
		&& gridWindow.value.y < y && y < visibleGridSize.value.height
);

const visibleFilledCells = computed(() => (filteredCells.value as FilledCell[])
		.map(({card, position}): FilledCell => ({
			card,
			// position
			position: {
				x: position.x - gridWindow.value.x,
				y: position.y - gridWindow.value.y,
			} as GridVec
		})));

/**
 * visible position of the grid in pixel, used for display and mapping from screen space to grid space
 */
const gridPosition = ref({x: 0, y: 0} as ScreenVec);
const gridWindow = computed(() => ({
	x: (Math.trunc(gridPosition.value.x / (tileWidth + gap)) + 1) * -1,
	y: (Math.trunc(gridPosition.value.y / (tileHeight + gap)) + 1) * -1,
} as GridVec))
/**
 * offset of the css grid relative to the map, both x and y are between -1 tile size + gap and 0
 */
const visibleGridOffset = computed(() => ({
	x: gridPosition.value.x % (tileWidth + gap) - (tileWidth + gap),
	y: gridPosition.value.y % (tileHeight + gap) - (tileWidth + gap),
} as ScreenVec))
const {width, height} = useElementBounding(gridView);
/**
 * size of the visible grid in number of tiles
 */
const visibleGridSize = computed(() => ({
	width: width.value % (tileWidth + gap) + 2,
	height: height.value % (tileHeight + gap) + 2,
}))

const {pressed} = useMousePressed({target: grid});
const {x: dx, y: dy} = useMouse({type: 'movement', target: grid});
const accumulatedDelta = {x: 0, y: 0};
const deltaThreshold = 2;

watchEffect(() => {
	if (!pressed.value) {
		return;
	}

	if (Math.abs(dx.value) < deltaThreshold && Math.abs(dy.value) < deltaThreshold) {
		accumulatedDelta.x += dx.value;
		accumulatedDelta.y += dy.value;
		return;
	}

	gridPosition.value.x += dx.value + accumulatedDelta.x;
	gridPosition.value.y += dy.value + accumulatedDelta.y;
	accumulatedDelta.x = 0;
	accumulatedDelta.y = 0;
	hasMoved = true;
})

function px(value: number): string {
	return `${ value.toString(10) }px`;
}


function dragOver(event: DragEvent) {
	if (!event.dataTransfer) {
		return;
	}
	event.preventDefault();
	x.value = event.clientX - left.value;
	y.value = event.clientY - top.value;
}

function drop(event: DragEvent) {
	try {
		setTile();
	}
	finally {
		draggableStore.dragged = null;
		deck.dragged = null;
	}
}

function pointerMove(event: PointerEvent) {
	x.value = event.clientX - left.value;
	y.value = event.clientY - top.value;
}

const canPlace = computed(() => {
	const hoveredCell = getHoveredCell();
	if (
			draggableStore.dragged !== null
			&& deck.active !== null
	) {
		const canPlace = gridStore.canPlace(deck.active, hoveredCell.position);
		console.log(canPlace);
		return canPlace;
	}

	return false;
})

</script>

<template>
	<pre class="debug">
pressed: {{ pressed }}
mouse delta: {{ dx }} | {{ dy }}
hovered cell: {{ hoveredCell.x }} | {{ hoveredCell.y }}
grid position: {{ gridPosition.x }} | {{ gridPosition.y }}
visible grid position: {{ visibleGridOffset.x }} | {{ visibleGridOffset.y }}
size: {{ visibleGridSize.width }} | {{ visibleGridSize.height }}
window: {{ gridWindow.x }} | {{ gridWindow.y }}
	</pre>
	<div ref="gridView" class="map-view">
		<div
				ref="grid"
				:class="{
					'is-dragging': draggableStore.dragged !== null,
					'can-place': canPlace,
				}"
				class="map"
				@click="interactCell"
				@dragover="dragOver"
				@drop="drop"
				@pointermove="pointerMove"
		>
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
	//margin: 200px;
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


	&:hover > .hovered,
	&.is-dragging > .hovered {
		grid-area: v-bind('hoveredCell.y') / v-bind('hoveredCell.x');
		pointer-events: none;
		outline: solid 2px rgba(90, 230, 90, 0.17);
		outline-offset: 1px;
		display: revert;
	}
	.hovered {
		display: none;
	}

	&.can-place > .hovered {
		animation: --pulse ease-in-out 500ms infinite;
	}

}

@keyframes --pulse {
	50% {
		scale: 1.05;
	}
}
</style>