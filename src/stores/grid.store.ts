import { defineStore } from "pinia";
import { computed, ComputedRef, ref } from "vue";
import { addVec, Vector2 } from "../helpers/vector.helper";
import { CardInstance } from "./deck.store";

declare const gridVec: unique symbol;
export type GridVec = Vector2 & { [gridVec]: 'grid vec' };

export type MaybeCard = CardInstance | undefined;

export interface Cell<card extends MaybeCard = MaybeCard> {
	card: card;
	position: GridVec
}

export interface FilledCell<card extends MaybeCard = MaybeCard> extends Cell<card> {
	card: Exclude<card, undefined>;
}

const neighbors = [
	{x: -1, y: -1}, {x: 0, y: -1}, {x: 1, y: -1},
	{x: -1, y: 0}, {x: 1, y: 0},
	{x: -1, y: 1}, {x: 0, y: 1}, {x: 1, y: 1},
] as GridVec[];

export const useGridStore = defineStore('grid', () => {
	const cells = ref<Cell[]>([])

	function cell(position: Readonly<GridVec>, card?: CardInstance): Cell {
		return {
			card,
			position,
		}
	}

	function getCellAt(position: Readonly<GridVec>): Cell {
		return cells.value.find(({position: {x, y}}) => position.x === x && position.y === y) ?? cell(position);
	}

	function getCardAt(position: Readonly<GridVec>): Card | undefined {
		return cells.value.find(({position: {x, y}}) => position.x === x && position.y === y)?.card;
	}

	function setCell(cell: Cell): Cell {
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

	function filterCells(predicate: (cell: Cell, index: number, array: Cell[]) => boolean): ComputedRef<Cell[]>;
	function filterCells<target extends Cell>(predicate: (cell: Cell, index: number, array: Cell[]) => cell is target): ComputedRef<target[]>;
	function filterCells(predicate: (cell: Cell, index: number, array: Cell[]) => boolean) {
		return computed(() => cells.value.filter(predicate))
	}

	/**
	 * Check if a card can be placed somewhere. A card can only be placed near another one (unless it's the first) and it
	 * all of it's to be nei
	 * @param card
	 * @param at
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

		const neighboringCells = neighbors.map(position => ({
			card: getCardAt(addVec(at, position)),
			position,
		}));

		// only allow placing cards near an existing card
		if (!neighboringCells.some(({card}) => card !== undefined)) {
			return false;
		}

		// check if the card is ok with all of it's to be neighbors
		return card.checkNeighbors?.(neighboringCells) ?? true
	}

	return {
		cells,
		getCellAt,
		bounds,
		setCell,
		place,
		filterCells,
		canPlace,
	}
})