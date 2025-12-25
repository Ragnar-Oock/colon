import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import { gap, tileHeight, tileWidth } from "../components/grid.config";
import { equalsVec, Vector2 } from "../helpers/vector.helper";
import type { GridVec } from "./grid.store";

export type ScreenVec = Vector2 & { __brand: 'screen vec' };
export const useBoardStore = defineStore('board', () => {
	/**
	 * maximum number of tiles visible in each axis
	 */
	const visibleGridSize = reactive({width: 0, height: 0});
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
	
	// center grid
	let negative_offset_y_multiplier = 0.058; 	// 1 = window height
	const board_center_x = (window.innerWidth * 0.5) - ((tileWidth + gap) * 0.5);
	const board_center_y = (window.innerHeight * 0.5) - ((tileHeight + gap) * 0.5);
	const offset = tileHeight + gap + (window.innerHeight * negative_offset_y_multiplier);
	const startingPosition = {x: board_center_x, y: board_center_y - offset};

	const gridPosition = reactive(startingPosition as ScreenVec);

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

	/**
	 * Convert a map position into a css grid position
	 * @param vec
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