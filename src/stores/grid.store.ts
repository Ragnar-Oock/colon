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

export const topLeft = 0;
export const top = 1;
export const topRight = 2;
export const left = 3;
export const right = 4;
export const bottomLeft = 5;
export const bottom = 6;
export const bottomRight = 7;

export type NeighBors = [
	topLeft: Cell, top: Cell, topRight: Cell,
	left: Cell, right: Cell,
	bottomLeft: Cell, bottom: Cell, bottomRight: Cell
]

/**
 * Limit the number of cells the flood fill algorithm is allowed to return
 */
const MAX_FLOOD_SIZE = 100;

/**
 * A column major Map of the placed cells.
 *
 * To access a cell do `<CellMap>.get(x)?.get(y)`.
 */
export type CellMap = Map<number, Map<number, FilledCell>>;

export const useGridStore = defineStore('grid', () => {
	const cells = ref<CellMap>(new Map());


	function hasCellAt(position: Readonly<GridVec>): boolean {
		return getCard(position.x, position.y) !== undefined;
	}

	function getCellAt(position: Readonly<GridVec>): Cell {
		return getCell(position.x, position.y) ?? cell(position)
	}

	function getCell(x: number, y: number): FilledCell | undefined {
		return cells
			.value
			.get(x)
			?.get(y)
	}

	function getCardAt(position: Readonly<GridVec>): CardInstance | undefined {
		return getCard(position.x, position.y);
	}

	function getCard(x: number, y: number): CardInstance | undefined {
		return cells
			.value
			.get(x)
			?.get(y)
			?.card;
	}

	function setCell(cell: Cell): Cell {
		if (!isFilled(cell)) {
			return cell;
		}
		let column = cells.value.get(cell.position.x)

		if (column === undefined) {
			column = new Map();
			cells.value.set(cell.position.x, column);
		}
		column.set(cell.position.y, cell);
		updateBounds(cell.position)

		return cell
	}

	function place(card: CardInstance, at: GridVec, force = false): boolean {
		if (!canPlace(card, at) && !force) {
			return false;
		}
		setCell(cell(at, card));

		bus.emit('placed', {card, at, forced: force});
		return true;
	}

	const bounds = ref({
		left: 0,
		top: 0,
		right: 0,
		bottom: 0,
	});

	function updateBounds({x, y}: { x: number, y: number }): void {
		const _bounds = bounds.value;
		_bounds.left = Math.min(x, _bounds.left);
		_bounds.right = Math.max(x, _bounds.right);
		_bounds.top = Math.min(y, _bounds.top);
		_bounds.bottom = Math.max(y, _bounds.bottom);

	}

	function filterCells<target extends FilledCell>(predicate: (cell: FilledCell) => cell is target): ComputedRef<target[]>;
	function filterCells(predicate: (cell: FilledCell) => boolean): ComputedRef<FilledCell[]>;
	function filterCells(predicate: (cell: FilledCell) => boolean): ComputedRef<FilledCell[]> {
		return computed(() =>
			Iterator
				.from(cells.value.values())
				.flatMap(column =>
					Iterator
						.from(column.values())
						.filter(predicate)
				)
				.toArray()
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

		if (card === null) {
			// oxlint-disable-next-line no-debugger
			debugger;
		}

		// check if the card is ok with all of it's to be neighbors
		return card.checkPlacement?.(neighboringCells) ?? true
	}

	/**
	 * Get the cells around a position given a Moor neighborhood.
	 * @param at the position around which the cells should be taken.
	 */
	function getNeighbors(at: GridVec): NeighBors {
		return neighbors.map(neighbor => getCellAt(addVec(at, neighbor))) as NeighBors
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
		getCell,
		hasCellAt,
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