import { defineStore } from "pinia";
import { computed, reactive } from "vue";
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

export interface Cell {
	card: CardInstance | undefined;
	position: Vector2
}

export const useGridStore = defineStore('grid', () => {
	const cells = reactive<Cell[]>([])

	function cell(position: Vector2): Cell {
		return {
			card: undefined,
			position,
		}
	}

	function getCellAt(position: Vector2): Cell {
		return cells.find(({position: {x, y}}) => position.x === x && position.y === y) ?? cell(position);
	}

	function setCell(cell: Cell): Cell {
		if (!cells.includes(cell)) {
			cells.push(cell);
		}

		return cell
	}

	const bounds = computed(() => cells.reduce(({bottom, left, right, top}, {position: {x, y}}) => {
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
	}))

	return {
		cells,
		getCellAt,
		bounds,
		setCell
	}
})