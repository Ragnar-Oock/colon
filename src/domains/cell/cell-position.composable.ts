import type { ComputedRef, MaybeRefOrGetter } from "vue";
import { computed, toValue } from "vue";
import { useBoardStore } from "../../stores/board.store";
import type { GridVec } from "../../stores/grid.store";

/**
 * Translate a coordinate in the map space to an area in the css grid
 * @param at the position of the map to convert to css grid coordinates
 */
export function useVisibleCellPosition(at: MaybeRefOrGetter<GridVec>): ComputedRef<GridVec>;
/**
 * Translate a coordinate in the map space to an area in the css grid
 * @param at the position of the map to convert to css grid coordinates
 * @param reactive get the result directly without a reactive wrapper
 */
export function useVisibleCellPosition(at: MaybeRefOrGetter<GridVec>, reactive: false): GridVec;
export function useVisibleCellPosition(at: MaybeRefOrGetter<GridVec>, reactive = true): ComputedRef<GridVec> | GridVec {
	const board = useBoardStore();
	const getter = (): GridVec => {
		const {x, y} = toValue(at);
		return ({
			x: x - board.gridWindow.x + 1 + board.halfSize.width,
			y: y - board.gridWindow.y + 1 + board.halfSize.height,
		} as GridVec);
	};
	return reactive ? computed(getter) : getter();
}

/**
 * Translate an area in the css grid to a coordinate on the map.
 * @param at the top left corner of the area to transform
 */
export function useMapCellPosition(at: MaybeRefOrGetter<GridVec>): ComputedRef<GridVec>;
/**
 * Translate an area in the css grid to a coordinate on the map.
 * @param at the top left corner of the area to transform
 * @param reactive get the result directly without a reactive wrapper
 */
export function useMapCellPosition(at: MaybeRefOrGetter<GridVec>, reactive: false): GridVec;
export function useMapCellPosition(at: MaybeRefOrGetter<GridVec>, reactive = true): ComputedRef<GridVec> | GridVec {
	const board = useBoardStore();
	const getter = (): GridVec => {
		const {x, y} = toValue(at);
		return {
			x: x + board.gridWindow.x - 1 - board.halfSize.width,
			y: y + board.gridWindow.y - 1 - board.halfSize.height,
		} as GridVec;
	};
	return reactive ? computed(getter) : getter();

}