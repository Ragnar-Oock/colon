import type { ComputedRef } from "vue";
import { computed } from "vue";
import { useBoardStore } from "../../stores/board.store";
import { useDeckStore } from "../../stores/deck.store";
import type { GridVec } from "../../stores/grid.store";
import { useGridStore } from "../../stores/grid.store";
import { useMapCellPosition } from "../cell/cell-position.composable";

let validPlacements: ComputedRef<GridVec[]> | undefined;

const emptyArray: GridVec[] = [];

export const useValidPlacements = (): ComputedRef<readonly GridVec[]> => {
	if (validPlacements !== undefined) {
		return validPlacements
	}

	const deck = useDeckStore();
	const board = useBoardStore();
	const grid = useGridStore();

	validPlacements = computed(() => {
		const active = deck.active;
		if (active === undefined) {
			return emptyArray;
		}

		const placements: GridVec[] = [];

		for (let x = 1; x < board.visibleGridSize.width; x++) {
			for (let y = 1; y < board.visibleGridSize.height; y++) {
				const renderPosition = {x, y} as GridVec;
				const position = useMapCellPosition(renderPosition, false);

				if (grid.hasCellAt(position) || !grid.canPlace(active, position)) {
					continue;
				}
				placements.push(renderPosition)
			}
		}

		return placements;
	})
	return validPlacements;
}