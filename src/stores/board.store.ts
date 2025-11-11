import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import { gap, tileHeight, tileWidth } from "../components/grid.config";
import type { Vector2 } from "../helpers/vector.helper";
import type { GridVec } from "./grid.store";

export type ScreenVec = Vector2 & { __brand: 'screen vec' };
export const useBoardStore = defineStore('board', () => {
	const visibleGridSize = reactive({width: 0, height: 0});
	const isPanning = ref(false);
	const pointerPosition = ref<ScreenVec | null>(null);

	const hoveredCell = computed(() => {
		if (pointerPosition.value === null) {
			return null
		}
		return ({
			x: Math.trunc(((pointerPosition.value.x) + (.5 * gap)) / (tileWidth + gap)) + gridWindow.value.x,
			y: Math.trunc(((pointerPosition.value.y) + (.5 * gap)) / (tileHeight + gap)) + gridWindow.value.y,
		} as GridVec);
	});
	const visuallyHoveredCell = computed(() => {
		if (hoveredCell.value) {
			return {
				x: hoveredCell.value.x - gridWindow.value.x + 1,
				y: hoveredCell.value.y - gridWindow.value.y + 1,
			};
		}
		return {x: 0, y: 0};
	})

	/**
	 * visible position of the grid in pixel, used for display and mapping from screen space to grid space
	 */
	const gridPosition = reactive({x: 0, y: 0} as ScreenVec);

	const gridWindow = computed(() => ({
		x: (Math.trunc(gridPosition.x / (tileWidth + gap)) + 1) * -1,
		y: (Math.trunc(gridPosition.y / (tileHeight + gap)) + 1) * -1,
	} as GridVec));

	/**
	 * offset of the css grid relative to the map, both x and y are between -1 tile size + gap and 0
	 */
	const visibleGridOffset = computed(() => ({
		x: gridPosition.x % (tileWidth + gap) - (tileWidth + gap),
		y: gridPosition.y % (tileHeight + gap) - (tileHeight + gap),
	} as ScreenVec));

	return {
		gridPosition,
		gridWindow,
		visibleGridOffset,
		visibleGridSize,
		isPanning,
		pointerPosition,
		hoveredCell,
		visuallyHoveredCell
	}
})