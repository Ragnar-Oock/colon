import { defineStore } from "pinia";
import type { ComputedRef } from "vue";
import { computed, ref } from "vue";
import type { CardInstance } from "../domains/card/card.helper";
import type { MaybeCard } from "../domains/card/card.type";
import type { Cell, FilledCell } from "../domains/cell/cell";
import { cell, isFilled } from "../domains/cell/cell";
import { bus } from "../event.helper";
import type { Vector2 } from "../helpers/vector.helper";
import { addVec, vec2 } from "../helpers/vector.helper";

declare const $gridVec: unique symbol;
export type GridVec = Vector2 & { [$gridVec]: 'grid vec' };

export const gridVec = vec2<GridVec>;

const neighbors = [
	{x: -1, y: -1}, {x: 0, y: -1}, {x: 1, y: -1},
	{x: -1, y: 0}, {x: 1, y: 0},
	{x: -1, y: 1}, {x: 0, y: 1}, {x: 1, y: 1},
] as GridVec[];

/**
 * Limit the number of cells the flood fill algorithm is allowed to return
 */
const MAX_FLOOD_SIZE = 100;


export const useGridStore = defineStore('grid', () => {
	const cells = ref<FilledCell[]>([]);


	function getCellAt(position: Readonly<GridVec>): Cell {
		return cells
				.value
				.find(({position: {x, y}}) => position.x === x && position.y === y)
			?? cell(position);
	}

	function getCardAt(position: Readonly<GridVec>): CardInstance | undefined {
		return getCard(position.x, position.y);
	}

	function getCard(x: number, y: number): CardInstance | undefined {
		return cells
			.value
			.find(({position}) => x === position.x && y === position.y)
			?.card;
	}

	function setCell(cell: Cell): Cell {
		if (!isFilled(cell)) {
			return cell;
		}

		if (!cells.value.includes(cell)) {
			cells.value.push(cell);
		}

		return cell
	}

	function place(card: CardInstance, at: GridVec): boolean {
		if (!canPlace(card, at)) {
			return false;
		}
		setCell(cell(at, card));

		bus.emit('placed', {card, at});
		return true;
	}

	const bounds = computed(() =>
		cells
			.value
			.reduce(
				({bottom, left, right, top}, {position: {x, y}}) => ({
					left: left < x ? left : x,
					top: top < y ? top : y,
					right: right < x ? x : right,
					bottom: bottom < y ? y : bottom,
				}),
				{
					left: 0,
					top: 0,
					right: 0,
					bottom: 0,
				}
			)
	);

	function filterCells<target extends FilledCell>(predicate: (cell: FilledCell, index: number) => cell is target): ComputedRef<target[]>;
	function filterCells(predicate: (cell: FilledCell, index: number) => boolean): ComputedRef<FilledCell[]>;
	function filterCells(predicate: (cell: FilledCell, index: number) => boolean): ComputedRef<FilledCell[]> {
		return computed(() => cells
			.value
			.filter(predicate)
		)
	}

	/**
	 * Check if a card can be placed somewhere. A card can only be placed near another one (unless it's the first) and if
	 * all of its neighborhood meets the requirements defined by its {@link CardInstance#checkPlacement `checkPlacement`}
	 * method.
	 * @param card the card to check the placement of
	 * @param at where to check the placement of the `card` on the map of `cells`
	 */
	function canPlace(card: Readonly<CardInstance>, at: Readonly<GridVec>): boolean {
		// at the start everywhere is a valid placement
		if (cells.value.length === 0) {
			return true;
		}

		// can't place on an existing tile (yet ?)
		const cellAt = getCellAt(at);
		if (cellAt.card !== undefined) {
			return false;
		}

		const neighboringCells = getNeighbors(at);

		// only allow placing cards near an existing card
		if (!neighboringCells.some(({card}) => card !== undefined)) {
			return false;
		}

		// check if the card is ok with all of it's to be neighbors
		return card.checkPlacement?.(neighboringCells) ?? true
	}

	/**
	 * Get the cells around a position given a Moor neighborhood.
	 * @param at the position around which the cells should be taken.
	 */
	function getNeighbors(at: GridVec): Cell[] {
		return neighbors.map(neighbor => getCellAt(addVec(at, neighbor)))
	}

	function floodFetch(start: GridVec, predicate: (card: MaybeCard) => boolean, limit = MAX_FLOOD_SIZE): FilledCell[] {
		const queue = [
			addVec(start, {x: 1, y: 0} as GridVec),
			addVec(start, {x: -1, y: 0} as GridVec),
			addVec(start, {x: 0, y: 1} as GridVec),
			addVec(start, {x: 0, y: -1} as GridVec),
		];
		const flood = new Set<FilledCell>();
		while (queue.length > 0) {
			let next = queue.shift();
			if (next === undefined || flood.size >= MAX_FLOOD_SIZE || flood.size >= limit) {
				break;
			}
			const cell = getCellAt(next);
			if (!isFilled(cell) || flood.has(cell)) {
				continue;
			}
			if (predicate(cell.card)) {
				flood.add(cell);
				queue.push(
					addVec(next, {x: 1, y: 0} as GridVec),
					addVec(next, {x: -1, y: 0} as GridVec),
					addVec(next, {x: 0, y: 1} as GridVec),
					addVec(next, {x: 0, y: -1} as GridVec),
				)
			}
		}
		return Array.from(flood);
	}

	return {
		cells,
		getCellAt,
		getCardAt,
		getCard,
		bounds,
		setCell,
		place,
		filterCells,
		canPlace,
		getNeighbors,
		floodFetch,
	}
})