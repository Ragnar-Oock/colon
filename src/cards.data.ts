import { merge } from "./helpers/array.helper";
import { CardDescriptor } from "./helpers/card.helper";
import { combine, expectAtLeast, expectNone } from "./helpers/neighborhood-predicate.helper";
import { countEmpty, countType } from "./helpers/score-multiplier.helper";
import { ofType } from "./helpers/score-predicate";
import { floodFetch } from "./helpers/score.helper";
import { Cell, isEmpty } from "./stores/grid.store";

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
			checkPlacement: expectAtLeast('town', 'road'),
			scoreContributors: floodFetch(ofType('town', 'bank'), 5),
		},
	},
	{
		ponderation: 1,
		proto: {
			name: 'road',
			icon: '🛣️',
			scoreContributors: ({floodFetch}) => {
				const connected = floodFetch(ofType('road'))
				const maxConnected = 5;
				return connected.length >= maxConnected ? connected.slice(0, 2) : connected;
			},
			multiplier: countType('bank')
		},
	},
	{
		ponderation: .2,
		proto: {
			name: 'brickFactory',
			icon: '🧱',
			checkPlacement: expectAtLeast('town'),
			scoreContributors: ({floodFetch, neighbors}) => {
				if (!expectNone('brickFactory')(neighbors)) {
					return [];
				}
				return floodFetch(ofType('town'), 5);
			},
			multiplier: neighbors => countType('brickFactory')(neighbors) > 0 ? 0 : 1
		},
	},
	{
		ponderation: .05,
		proto: {
			name: 'bank',
			icon: '🪙',
			checkPlacement: combine(
				expectAtLeast('town'),
				expectNone('quarry', 'brickFactory'),
			),
			scoreContributors: floodFetch(ofType('town')),
			scoreContribution: 2,
			bonus: type => type === 'town' ? 1 : 0,
			baseScore: 4,
			multiplier: countType('town'),
		},
	},
	{
		ponderation: .5,
		proto: {
			name: 'quarry',
			icon: '🪨',
			checkPlacement: combine(
				expectAtLeast('road'),
				expectAtLeast('meadow', 'forest'),
				expectNone('town'),
			),
			scoreContributors: ({neighbors}) =>
				neighbors.filter(cell => ['field', 'meadow', 'bank'].includes(cell.card?.name!)),
			baseScore: 2,
		},
	},
	{
		ponderation: .5,
		proto: {
			name: 'field',
			icon: '🌾',
			checkPlacement: combine(
				expectNone('quarry'),
				expectAtLeast('meadow', 'road', 'town'),
			),
			scoreContributors: ({neighbors}) =>
				neighbors.filter(cell => ['field', 'meadow'].includes(cell.card?.name!))
		},
	},
	{
		ponderation: .5,
		proto: {
			name: 'meadow',
			icon: '🐑',
			checkPlacement: expectAtLeast('meadow', 'road', 'town'),
			scoreContributors: floodFetch(ofType('meadow', 'field')),
		},
	},
	{
		ponderation: 1,
		proto: {
			name: 'forest',
			icon: '🌳',
			checkPlacement: expectAtLeast('meadow', 'forest', 'field', 'road'),
			scoreContributors: ({floodFetch, neighbors}) =>
				merge<Cell>(
					floodFetch(ofType('meadow', 'field')),
					neighbors.filter(isEmpty)
				),
			multiplier: countEmpty()
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