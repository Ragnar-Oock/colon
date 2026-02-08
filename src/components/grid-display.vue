<script lang="ts" setup>
	import { useElementBounding } from "@vueuse/core";
	import { useTemplateRef } from "vue";
	import type { ScreenVec } from "../stores/board.store";
	import { useBoardStore } from "../stores/board.store";
	import { useDeckStore } from "../stores/deck.store";
	import { useDraggableStore } from "../stores/draggable.store";
	import { useGridStore } from "../stores/grid.store";
	// noinspection ES6UnusedImports
	import { gap, tileHeight, tileWidth } from "./grid.config";
	import HoveredCell from "./hovered-cell.vue";
	import PlacedCards from "./placed-cards.vue";
	import PlacementScores from "./placement-scores.vue";
	import ValidPlacements from "./valid-placements.vue";


	const gridStore = useGridStore();
	const deck = useDeckStore();
	const draggable = useDraggableStore();
	const board = useBoardStore();

	const grid = useTemplateRef<HTMLDivElement>('grid');
	const {top, left} = useElementBounding(grid);

	function setTile(): void {
		if (deck.active === undefined || board.hoveredCell === undefined) {
			return;
		}
		const placed = gridStore.place(deck.active, board.hoveredCell, deck.isCreativeEnabled);
		if (placed && !deck.isCreativeEnabled) {
			deck.remove(deck.active);
		}
	}

	function interactCell(): void {
		if (board.isPanning) {
			board.isPanning = false;
			return;
		}
		setTile();
	}

	function px(value: number): string {
		return `${ value.toString(10) }px`;
	}

	function dragOver(event: DragEvent): void {
		if (!event.dataTransfer) {
			return;
		}
		pointerMove(event)
	}

	function drop(): void {
		try {
			setTile();
		}
		finally {
			draggable.end();
		}
	}

	function pointerMove(event: { clientX: number, clientY: number }): void {
		board.pointerPosition = {
			x: event.clientX - left.value,
			y: event.clientY - top.value,
		} as ScreenVec;
	}

</script>

<template>
	<div
		ref="grid"
		class="map"
		:class="{
			'is-dragging': draggable.dragged !== null,
		}"
		@click="interactCell"
		@dragover.prevent="dragOver"
		@drop="drop"
		@pointermove="pointerMove"
	>
		<hovered-cell/>
		<placement-scores/>
		<PlacedCards/>
		<ValidPlacements/>
	</div>
</template>

<style scoped>
	.map {
		--tileWidth: v-bind('px(tileWidth)');
		--tileHeight: v-bind('px(tileHeight)');
		--gap: v-bind('gap');

		display: grid;
		grid: repeat(v-bind('board.visibleGridSize.height'), var(--tileHeight)) / repeat(v-bind('board.visibleGridSize.width'), var(--tileWidth));
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

		&.is-dragging {
			cursor: grabbing;
		}
	}
</style>