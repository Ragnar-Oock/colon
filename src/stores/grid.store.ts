import { defineStore } from "pinia";
import type { ComputedRef } from "vue";
import { computed, ref } from "vue";
import { bus } from "../event.helper";
import type { CardInstance } from "../helpers/card.helper";
import type { ScoreHelpers } from "../helpers/score.helper";
import type { Vector2 } from "../helpers/vector.helper";
import { addVec, toString, vec2 } from "../helpers/vector.helper";
import { useBoardStore } from "./board.store";
import { useDeckStore } from "./deck.store";
import { useScoreStore } from "./score.store";

declare const $gridVec: unique symbol;
export type GridVec = Vector2 & { [$gridVec]: 'grid vec' };

export const gridVec = vec2<GridVec>;

export type MaybeCard = CardInstance | undefined;

export interface Cell<card extends MaybeCard = MaybeCard> {
	card: card;
	position: GridVec
}

export interface FilledCell<card extends MaybeCard = MaybeCard> extends Cell<card> {
	card: NonNullable<card>;
}

export interface EmptyCell extends Cell {
	card: undefined;
}

export const isFilled = (cell: Cell): cell is FilledCell => cell.card !== undefined
export const isEmpty = (cell: Cell): cell is EmptyCell => cell.card === undefined

const neighbors = [
	{x: -1, y: -1}, {x: 0, y: -1}, {x: 1, y: -1},
	{x: -1, y: 0}, {x: 1, y: 0},
	{x: -1, y: 1}, {x: 0, y: 1}, {x: 1, y: 1},
] as GridVec[];

/**
 * Limit the number of cells the flood fill algorithm is allowed to return
 */
const MAX_FLOOD_SIZE = 100;

export function cell(position: Readonly<GridVec>, card?: undefined): EmptyCell;
export function cell<instance extends CardInstance>(position: Readonly<GridVec>, card: instance): FilledCell<instance>;
export function cell(position: Readonly<GridVec>, card?: CardInstance): Cell {
	return {
		card,
		position,
	}
}

function getCard(cells: readonly FilledCell[], x: number, y: number): CardInstance | undefined {
	return cells.find(({position}) => x === position.x && y === position.y)?.card;
}

export const useGridStore = defineStore('grid', () => {
	const score = useScoreStore();

	const cells = ref<FilledCell[]>([]);


	function getCellAt(cells: readonly FilledCell[], position: Readonly<GridVec>): Cell {
		return cells.find(({position: {x, y}}) => position.x === x && position.y === y) ?? cell(position);
	}

	function getCardAt(cells: readonly FilledCell[], position: Readonly<GridVec>): CardInstance | undefined {
		return getCard(cells, position.x, position.y);
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
		if (!canPlace(cells.value, card, at)) {
			return false;
		}
		updateScore(card, at);
		setCell(cell(at, card));

		bus.emit('placed');
		return true;
	}

	const deck = useDeckStore();
	const board = useBoardStore();

	function getScoreContributors(card: CardInstance, position: GridVec, effectiveCells: FilledCell[]): (Cell & {
		score: number;
		bonus: number;
	})[] {
		if (card === null || position === null || !canPlace(cells.value, card, position)) {
			return [];
		}

		const helpers = getScoreHelpers(position, effectiveCells);

		const bonuses = new Map(
			getNeighbors(cells.value, position)
				.filter(isFilled)
				// oxlint-disable-next-line no-map-spread
				.map(neighbor => ({
					...neighbor,
					bonus: neighbor.card.bonus?.(card) ?? 0,
					score: 0,
				}))
				.filter(({bonus}) => bonus > 0)
				.map(neighbor => [toString(neighbor.position), neighbor])
		);
		const contributors = new Map(
			card
				.scoreContributors?.(helpers)
				// oxlint-disable-next-line no-map-spread
				.map(contributor => ({
					...contributor,
					score: (contributor.card?.scoreContribution ?? 1) * Math.max(contributor.card?.multiplier?.(getNeighbors(effectiveCells, contributor.position)) ?? 1, 1),
					bonus: 0
				}))
				.map(contributor => [toString(contributor.position), contributor])
		);

		bonuses.forEach((bonus, position) => {
			const contributor = contributors.get(position);
			if (contributor) {
				contributor.bonus = bonus.bonus
			}
			else {
				contributors.set(position, bonus);
			}
		})

		return contributors.values().toArray();
	}

	const scoreContributors = computed<(Cell & { score: number, bonus: number })[] | null>(() => {
		const card = deck.active;
		const position = board.hoveredCell;
		if (card === null || position === null || !canPlace(cells.value, card, position)) {
			return null;
		}

		const contributors = getScoreContributors(card, position, cells.value);

		return contributors.length === 0 ? null : contributors;
	})

	const placementScore = computed(() =>
		scoreContributors.value
			?.reduce((total, {score, bonus}) => total + score + bonus, 1)
		?? 1
	)

	function getScoreHelpers(at: Readonly<GridVec>, cells: FilledCell[]): ScoreHelpers {
		return {
			get neighbors() {
				return getNeighbors(cells, at)
			},
			get placement() {
				return at;
			},
			getNeighborsAt: (position: Readonly<GridVec>) => getNeighbors(cells, position),
			floodFetch: (predicate, limit) => floodFetch(cells, at, predicate, limit)
		}
	}

	function updateScore(card: CardInstance, at: Readonly<GridVec>): void {
		const baseScore = card.baseScore ?? 1;
		const placementScore =
			getScoreContributors(card, at, Array.from(cells.value))
				?.reduce((acc, {score, bonus}) => acc + score + bonus, baseScore)
			?? baseScore;


		score.score += placementScore;
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
	 * Check if a card can be placed somewhere. A card can only be placed near another one (unless it's the first) and it
	 * all of it's to be nei
	 * @param cells the cells making up the map to use for the placement check
	 * @param card the card to check the placement of
	 * @param at where to check the placement of the `card` on the map of `cells`
	 */
	function canPlace(cells: readonly FilledCell[], card: Readonly<CardInstance>, at: Readonly<GridVec>): boolean {
		// at the start everywhere is a valid placement
		if (cells.length === 0) {
			return true;
		}

		// can't place on an existing tile (yet ?)
		const cellAt = getCellAt(cells, at);
		if (cellAt.card !== undefined) {
			return false;
		}

		const neighboringCells = getNeighbors(cells, at);

		// only allow placing cards near an existing card
		if (!neighboringCells.some(({card}) => card !== undefined)) {
			return false;
		}

		// check if the card is ok with all of it's to be neighbors
		return card.checkPlacement?.(neighboringCells) ?? true
	}

	function getNeighbors(cells: readonly FilledCell[], at: GridVec): Cell[] {
		return neighbors.map(neighbor => getCellAt(cells, addVec(at, neighbor)))
	}

	function floodFetch(cells: readonly FilledCell[], start: GridVec, predicate: (card: MaybeCard) => boolean, limit = MAX_FLOOD_SIZE): FilledCell[] {
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
			const cell = getCellAt(cells, next);
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
		getCellAt: (position: Readonly<GridVec>): Cell => getCellAt(cells.value, position),
		getCardAt: (position: Readonly<GridVec>): CardInstance | undefined => getCardAt(cells.value, position),
		getCard: (x: number, y: number): CardInstance | undefined => getCard(cells.value, x, y),
		bounds,
		setCell,
		place,
		filterCells,
		canPlace: (card: CardInstance, at: Readonly<GridVec>): boolean => canPlace(cells.value, card, at),
		scoreContributors,
		placementScore
	}
})