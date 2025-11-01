import { defineStore } from "pinia";
import { computed, ComputedRef, reactive, ref } from "vue";
import { CardInstance } from "./deck.store";

interface Vector2 {
	/**
	 * a signed integer designating a row of the grid
	 */
	x: number;
	/**
	 * a signed integer designating a column of the grid
 	 */
	y: number;
}

export interface Cell<card extends (CardInstance | undefined) = (CardInstance | undefined)> {
	card: card;
	position: Vector2
}

export interface FilledCell extends Cell {
	card: CardInstance;
}

export const useGridStore = defineStore('grid', () => {
	const cells = ref<Cell[]>([])

	function cell(position: Vector2): Cell {
		return {
			card: undefined,
			position,
		}
	}

	function getCellAt(position: Vector2): Cell {
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

	function filterCells<target extends Cell>(predicate: (cell: Cell, index: number, array: Cell[]) => cell is target): ComputedRef<target[]> {
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