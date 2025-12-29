import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import { gap, tileHeight, tileWidth } from "../components/grid.config";
import type { Vector2 } from "../helpers/vector.helper";
import { equalsVec } from "../helpers/vector.helper";
import type { GridVec } from "./grid.store";

export type ScreenVec = Vector2 & { __brand: 'screen vec' };
export const useBoardStore = defineStore('board', () => {
	/**
	 * maximum number of tiles visible in each axis
	 */
	const gridSize = reactive({width: 0, height: 0});
	/**
	 * maximum number of tiles visible on each axis + a one tile buffer on each side
	 */
	const visibleGridSize = computed(() => ({
		width: gridSize.width + 2,
		height: gridSize.height + 2,
	}));
	/**
	 * size of the board element in pixels
	 */
	const boardSize = reactive<ScreenVec>({x: 0, y: 0} as ScreenVec);
	const isPanning = ref(false);
	const pointerPosition = ref<ScreenVec | null>(null);

	const hoveredCell = computed<GridVec | null>((old) => {
		if (pointerPosition.value === null) {
			return null
		}
		const newValue = ({
			x: Math.trunc(((pointerPosition.value.x) + (.5 * gap)) / (tileWidth + gap)) + gridWindow.value.x,
			y: Math.trunc(((pointerPosition.value.y) + (.5 * gap)) / (tileHeight + gap)) + gridWindow.value.y,
		} as GridVec);

		if (old && equalsVec(old, newValue)) {
			return old;
		}
		return newValue
	});

	const visuallyHoveredCell = computed(() => {
		if (hoveredCell.value) {
			return {
				x: hoveredCell.value.x - gridWindow.value.x + 1,
				y: hoveredCell.value.y - gridWindow.value.y + 1,
			} as GridVec;
		}
		return {x: 0, y: 0} as GridVec;
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
		x: (gridPosition.x - Math.trunc(gridSize.width / 2)) % (tileWidth + gap) - (tileWidth + gap),
		y: (gridPosition.y - Math.trunc(gridSize.height / 2)) % (tileHeight + gap) - (tileHeight + gap),
	} as ScreenVec));

	/**
	 * @param vec a map coordinate to convert into a css grid coordinate
	 */
	function toDisplayGrid(vec: GridVec): GridVec {
		return {
			x: vec.x - gridWindow.value.x + 1,
			y: vec.y - gridWindow.value.y + 1,
		} as GridVec
	}


	return {
		gridPosition,
		gridWindow,
		gridSize,
		visibleGridOffset,
		visibleGridSize,
		boardSize,
		isPanning,
		pointerPosition,
		hoveredCell,
		visuallyHoveredCell,
		toDisplayGrid
	}
})