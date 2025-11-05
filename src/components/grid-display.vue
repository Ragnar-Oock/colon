<script setup lang="ts">
import { useElementBounding } from "@vueuse/core";
import { computed, reactive, useTemplateRef } from "vue";
import { useBoardStore } from "../stores/board.store";
import { useDeckStore } from "../stores/deck.store";
import { useDraggableStore } from "../stores/draggable.store";
import { GridVec, useGridStore } from "../stores/grid.store";
import { gap, tileHeight, tileWidth } from "./grid.config";
import PlacedCards from "./placed-cards.vue";
import ValidPlacements from "./valid-placements.vue";


const gridStore = useGridStore();
const deck = useDeckStore();
const draggableStore = useDraggableStore();
const board = useBoardStore();

const grid = useTemplateRef<HTMLDivElement>('grid');
const {top, left} = useElementBounding(grid);

const pointer = reactive({x: 0, y: 0});

const hoveredCell = computed(() => ({
	x: Math.trunc(((pointer.x) + (.5 * gap)) / (tileWidth + gap)) + 1,
	y: Math.trunc(((pointer.y) + (.5 * gap)) / (tileHeight + gap)) + 1,
} as GridVec))

const getHoveredCellPosition = () => ({
	x: hoveredCell.value.x + board.gridWindow.x - 1,
	y: hoveredCell.value.y + board.gridWindow.y - 1,
} as GridVec);

function setTile() {
	if (deck.active === null) {
		return;
	}
	if (gridStore.place(deck.active, getHoveredCellPosition())) {
		deck.remove(deck.active);
	}
}

function interactCell() {
	if (board.isPanning) {
		board.isPanning = false;
		return;
	}
	setTile();
}


function px(value: number): string {
	return `${ value.toString(10) }px`;
}

function dragOver(event: DragEvent) {
	if (!event.dataTransfer) {
		return;
	}
	event.preventDefault();
	pointer.x = event.clientX - left.value;
	pointer.y = event.clientY - top.value;
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
	pointer.x = event.clientX - left.value;
	pointer.y = event.clientY - top.value;
}

const canPlace = computed(() => {
	if (
			draggableStore.dragged !== null
			&& deck.active !== null
	) {
		return gridStore.canPlace(deck.active, gridStore.getCellAt(getHoveredCellPosition()).position);
	}

	return false;
})

</script>

<template>
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
		<PlacedCards/>
	</div>
</template>

<style scoped>
.map {
	--tileWidth: v-bind('px(tileWidth)');
	--tileHeight: v-bind('px(tileHeight)');
	--gap: v-bind('gap');

	display: grid;
	grid: repeat(v-bind('board.visibleGridSize.width'), var(--tileHeight)) / repeat(v-bind('board.visibleGridSize.width'), var(--tileWidth));
	gap: v-bind('px(gap)');


	transform: translateX(v-bind('px(board.visibleGridOffset.x)')) translateY(v-bind('px(board.visibleGridOffset.y)'));

	height: calc(v-bind('board.visibleGridSize.height') * (var(--tileHeight) + var(--gap)));
	width: calc(v-bind('board.visibleGridSize.width') * (var(--tileWidth) + var(--gap)));
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