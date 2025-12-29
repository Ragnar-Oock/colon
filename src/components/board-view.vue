<script lang="ts" setup>

	import { useElementBounding, useElementSize } from "@vueuse/core";
	import { reactive, ref, useTemplateRef, watchEffect } from "vue";
	import { addVec, setVec, subtractVec } from "../helpers/vector.helper";
	import { ScreenVec, useBoardStore } from "../stores/board.store";
	import GridDisplay from "./grid-display.vue";
	import { gap, tileHeight, tileWidth } from "./grid.config";

	const board = useBoardStore();

	const boardRef = useTemplateRef<HTMLDivElement>('boardRef');
	const {width, height} = useElementBounding(boardRef);

	watchEffect(() => {
		board.visibleGridSize.width = Math.ceil(width.value / (tileWidth + gap)) + 2;
		board.visibleGridSize.height = Math.ceil(height.value / (tileHeight + gap)) + 2;
	})
	const pressed = ref(false);

	const pointer = reactive({x: 0, y: 0} as ScreenVec);
	const previousPointer = reactive({x: 0, y: 0} as ScreenVec);
	const accumulatedDelta = {x: 0, y: 0} as ScreenVec;

	const deltaThreshold = 2;

	function move(event: PointerEvent) {
		pointer.x = event.clientX;
		pointer.y = event.clientY;
	}

	function release() {
		pressed.value = false;
		board.isPanning = false;
	}

	watchEffect(() => {
		try {
			if (!pressed.value) {
				return;
			}
			const delta = subtractVec(pointer, previousPointer);

			if (!board.isPanning && Math.abs(delta.x) < deltaThreshold && Math.abs(delta.y) < deltaThreshold) {
				setVec(accumulatedDelta, addVec(accumulatedDelta, delta))
				return;
			}

			board.gridPosition.x += delta.x + accumulatedDelta.x;
			board.gridPosition.y += delta.y + accumulatedDelta.y;

			accumulatedDelta.x = 0;
			accumulatedDelta.y = 0;

			board.isPanning = true;
		}
		finally {
			setVec(previousPointer, pointer);
		}
	})

	const boardSize = useElementSize(boardRef);
	watchEffect(() => {
		setVec(board.boardSize, {x: boardSize.width.value, y: boardSize.height.value} as ScreenVec);
	})

</script>

<template>
	<div
		ref="boardRef"
		class="board"
		@pointercancel="release"
		@pointerdown="pressed=true"
		@pointermove="move"
		@pointerup="release"
	>
		<grid-display/>
	</div>
</template>

<style scoped>
	.board {
		overflow: clip;
		height: 100vh;
		position: relative;
		isolation: isolate;

		&::after {
			--hsl: 272, 48.4%, 6.1%;

			content: '';
			position: absolute;
			inset: 0;
			box-shadow: inset 0 0 100px 0 hsla(var(--hsl), 0.21),
			inset 0 0 15px 0 hsla(var(--hsl), 0.57);
			pointer-events: none;
			z-index: 1;
		}
	}
</style>