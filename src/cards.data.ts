import { CardDescriptor } from "./helpers/card.helper";
import { combine, expectAtLeast, expectNone } from "./helpers/neighborhood-predicate.helper";
import { countEmpty, countType } from "./helpers/score-multiplier.helper";
import { ofType } from "./helpers/score-predicate";
import { FilledCell } from "./stores/grid.store";

declare module './helpers/card.helper' {
	// noinspection JSUnusedGlobalSymbols
	export interface CardTypes<T> {
		town: T;
		road: T;
		brickFactory: T;
		bank: T;
		quarry: T;
		field: T;
		forest: T;
		meadow: T;
	}
}

export const cards = [
	{
		ponderation: 1,
		proto: {
			name: 'town',
			icon: '🏘️',
			checkNeighbors: expectAtLeast('town', 'road'),
			scoreContributors: (placement, {floodFetch}) =>
				floodFetch(placement, ofType('town')) as FilledCell[],
		},
	},
	{
		ponderation: 1,
		proto: {
			name: 'road',
			icon: '🛣️',
			scoreContributors: () => [],
			multiplier: () => 1
		},
	},
	{
		ponderation: .5,
		proto: {
			name: 'brickFactory',
			icon: '🧱',
			checkNeighbors: expectAtLeast('town'), scoreContributors: (placement, {floodFetch}) =>
				floodFetch(placement, ofType('town')) as FilledCell[],
			multiplier: neighbors => countType('brickFactory')(neighbors) > 0 ? 0 : 1
		},
	},
	{
		ponderation: .5,
		proto: {
			name: 'bank',
			icon: '🪙',
			checkNeighbors: expectAtLeast('town'),
			bonus: type => type === 'town' ? 1 : 0
		},
	},
	{
		ponderation: .5,
		proto: {
			name: 'quarry',
			icon: '🪨',
		},
	},
	{
		ponderation: .5,
		proto: {
			name: 'field',
			icon: '🌾',
			checkNeighbors: combine(
				expectNone('quarry'),
				expectAtLeast('meadow', 'road', 'town'),
			)
		},
	},
	{
		ponderation: .5,
		proto: {
			name: 'forest',
			icon: '🌳',
			scoreContributors: (placement, {floodFetch}) =>
				floodFetch(placement, ofType('meadow', 'field')) as FilledCell[],
			multiplier: countEmpty()
		},
	},
	{
		ponderation: .5,
		proto: {
			name: 'meadow',
			icon: '🐑',
			checkNeighbors: expectAtLeast('meadow', 'road', 'town'),
			scoreContributors: (placement, {floodFetch}) =>
				floodFetch(placement, ofType('meadow', 'field')) as FilledCell[],
		},
	},
] satisfies CardDescriptor[];

/**
 * Register all the predefined cards
 * @param register
 */
export function registerAllCards(register: (card: CardDescriptor) => void) {
	cards.forEach(card => register(card));
}