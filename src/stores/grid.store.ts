import { defineStore } from "pinia";
import { computed, ComputedRef, ref } from "vue";
import { CardInstance, ScoreHelpers } from "../helpers/card.helper";
import { addVec, toString, Vector2 } from "../helpers/vector.helper";
import { useBoardStore } from "./board.store";
import { useDeckStore } from "./deck.store";
import { useScoreStore } from "./score.store";

declare const gridVec: unique symbol;
export type GridVec = Vector2 & { [gridVec]: 'grid vec' };

export type MaybeCard = CardInstance | undefined;

export interface Cell<card extends MaybeCard = MaybeCard> {
	card: card;
	position: GridVec
}

export interface FilledCell<card extends MaybeCard = MaybeCard> extends Cell<card> {
	card: NonNullable<card>;
}

const isFilled = (cell: Cell): cell is FilledCell => cell.card !== undefined

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
	const score = useScoreStore();

	const cells = ref<FilledCell[]>([])

	function cell(position: Readonly<GridVec>, card?: CardInstance): Cell {
		return {
			card,
			position,
		}
	}

	function getCellAt(cells: ReadonlyArray<FilledCell>, position: Readonly<GridVec>): Cell {
		return cells.find(({position: {x, y}}) => position.x === x && position.y === y) ?? cell(position);
	}

	function getCardAt(cells: ReadonlyArray<FilledCell>, position: Readonly<GridVec>): CardInstance | undefined {
		return getCard(cells, position.x, position.y);
	}

	function getCard(cells: ReadonlyArray<FilledCell>, X: number, Y: number): CardInstance | undefined {
		return cells.find(({position: {x, y}}) => X === x && Y === y)?.card;
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
		return true;
	}

	const deck = useDeckStore();
	const board = useBoardStore();

	function getScoreContributors(card: CardInstance, position: GridVec, effectiveCells: FilledCell[]): (FilledCell & {
		score: number;
		bonus: number;
	})[] {
		if (card === null || position === null || !canPlace(cells.value, card, position)) {
			return [];
		}

		const helpers = getScoreHelpers(effectiveCells);

		const bonuses = new Map(
			getNeighbors(cells.value, position)
				.filter(isFilled)
				.map(neighbor => ({
					...neighbor,
					bonus: neighbor.card.bonus?.(card.name) ?? 0,
					score: 0,
				}))
				.map(neighbor => [toString(neighbor.position), neighbor])
		);
		const contributors = new Map(
			card
				.scoreContributors?.(position, helpers)
				.map(contributor => ({
					...contributor,
					score: 1,
					bonus: 0
				}))
				.map(contributor => [toString(contributor.position), contributor])
			?? []);

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

	const scoreContributors = computed<(FilledCell & { score: number, bonus: number })[] | null>(() => {
		const card = deck.active;
		const position = board.hoveredCell;
		if (card === null || position === null || !canPlace(cells.value, card, position)) {
			return null;
		}

		const contributors = getScoreContributors(card, position, cells.value);

		return contributors.length === 0 ? null : contributors;
	})

	const placementScore = computed(() =>
		Math.max(
			scoreContributors.value
				?.reduce((total, {score, bonus}) => total + score + bonus, 0) ?? 0,
			1
		)
	)

	function getScoreHelpers(cells: FilledCell[]): ScoreHelpers {
		return {
			getNeighbors: at => getNeighbors(cells, at),
			floodFetch: (start, predicate) => floodFetch(cells, start, predicate)
		}
	}

	function updateScore(card: CardInstance, at: Readonly<GridVec>): void {
		const placementScore = Math.max(
			getScoreContributors(card, at, Array.from(cells.value))
				?.reduce((acc, {score, bonus}) => acc + score + bonus, 0) ?? 0,
			1,
		);

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
	function filterCells(predicate: (cell: FilledCell, index: number) => boolean) {
		return computed(() => cells
			.value
			.filter(predicate)
		)
	}

	/**
	 * Check if a card can be placed somewhere. A card can only be placed near another one (unless it's the first) and it
	 * all of it's to be nei
	 * @param cells
	 * @param card
	 * @param at
	 */
	function canPlace(cells: ReadonlyArray<FilledCell>, card: Readonly<CardInstance>, at: Readonly<GridVec>): boolean {
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
		return card.checkNeighbors?.(neighboringCells) ?? true
	}

	function getNeighbors(cells: ReadonlyArray<FilledCell>, at: GridVec): Cell[] {
		return neighbors.map(position => ({
			card: getCardAt(cells, addVec(at, position)),
			position,
		}))
	}

	function floodFetch(cells: ReadonlyArray<FilledCell>, start: GridVec, predicate: (card: MaybeCard) => boolean): Cell[] {
		const queue = [
			addVec(start, {x: 1, y: 0} as GridVec),
			addVec(start, {x: -1, y: 0} as GridVec),
			addVec(start, {x: 0, y: 1} as GridVec),
			addVec(start, {x: 0, y: -1} as GridVec),
		];
		const flood = new Set<Cell>();
		while (queue.length > 0) {
			let next = queue.shift();
			if (next === undefined || flood.size > MAX_FLOOD_SIZE) {
				break;
			}
			const cell = getCellAt(cells, next);
			if (flood.has(cell) || cell.card === undefined) {
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
		getCellAt: (position: Readonly<GridVec>) => getCellAt(cells.value, position),
		getCardAt: (position: Readonly<GridVec>) => getCardAt(cells.value, position),
		getCard: (x: number, y: number) => getCard(cells.value, x, y),
		bounds,
		setCell,
		place,
		filterCells,
		canPlace: (card: CardInstance, at: Readonly<GridVec>) => canPlace(cells.value, card, at),
		scoreContributors,
		placementScore
	}
})