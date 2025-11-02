import { defineStore } from "pinia";
import { computed, ComputedRef, ref } from "vue";
import { CardInstance } from "./deck.store";

export interface Vector2 {
	/**
	 * a signed integer designating a row of the grid
	 */
	x: number;
	/**
	 * a signed integer designating a column of the grid
 	 */
	y: number;
}

export type GridVec = Vector2 & { __brand: 'grid vec' };

export type MaybeCard = CardInstance | undefined;

export interface Cell<card extends MaybeCard = MaybeCard> {
	card: card;
	position: GridVec
}

export interface FilledCell<card extends MaybeCard = MaybeCard> extends Cell<card> {
	card: Exclude<card, undefined>;
}

export const useGridStore = defineStore('grid', () => {
	const cells = ref<Cell[]>([])

	function cell(position: GridVec): Cell {
		return {
			card: undefined,
			position,
		}
	}

	function getCellAt(position: GridVec): Cell {
		return cells.value.find(({position: {x, y}}) => position.x === x && position.y === y) ?? cell(position);
	}

	function setCell(cell: Cell): Cell {
		if (!cells.value.includes(cell)) {
			cells.value.push(cell);
		}

		return cell
	}

	const bounds = computed(() => cells.value.reduce(({bottom, left, right, top}, {position: {x, y}}) => {
		return {
			left: left < x ? left : x,
			top: top < y ? top : y,
			right: right < x ? x : right,
			bottom: bottom < y ? y : bottom ,
		}
	}, {
		left: 0,
		top: 0,
		right: 0,
		bottom: 0,
	}));

	function filterCells(predicate: (cell: Cell, index: number, array: Cell[]) => boolean): ComputedRef<Cell[]>;
	function filterCells<target extends Cell>(predicate: (cell: Cell, index: number, array: Cell[]) => cell is target): ComputedRef<target[]>;
	function filterCells(predicate: (cell: Cell, index: number, array: Cell[]) => boolean) {
		return computed(() => cells.value.filter(predicate))
	}

	return {
		cells,
		getCellAt,
		bounds,
		setCell,
		filterCells
	}
})