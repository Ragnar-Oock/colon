import cobblestoneUrl from './assets/textures/cobblestone.png';
import grassUrl from './assets/textures/grass.png';
import roadUrl from './assets/textures/road.png';
import waterUrl from './assets/textures/water.png';

import type { CardDescriptor, TextureData } from "./domains/card/card.helper";
import { countEmpty, countType } from "./domains/score/score-multiplier.helper";
import { ofGroup, ofType } from "./domains/score/score-predicate";
import { floodFetch, limitContribution, mergeContribution, neighborFetch } from "./domains/score/score.helper";
import { atLeastOneInGroup, atLeastOneOfType, combine, noneOfType } from "./helpers/neighborhood-predicate.helper";

declare module './domains/card/card.helper' {
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
		river: T;
	}

	// noinspection JSUnusedGlobalSymbols
	export interface CardGroups<T> {
		natural: T;
		building: T;
		land: T;
		agriculture: T;
	}
}

const grassTexture = {
	url: grassUrl,
	display: "connected",
} as const satisfies TextureData;

const roadTexture = {
	url: roadUrl,
	display: "connected",
} as const satisfies TextureData;

const cobblestoneTexture = {
	url: cobblestoneUrl,
	display: "connected"
} as const satisfies TextureData

const cards = [
	{
		ponderation: 1,
		proto: {
			name: 'road',
			icon: '🛣️',
			scoreContributors: limitContribution(
				floodFetch(ofType('road'), 5),
				5,
				2
			),
			multiplier: countType('bank'),
			groups: ['building'],
			color: '#4e6c65',
			tile: roadTexture,
		},
	},
	{
		ponderation: .5,
		proto: {
			name: 'field',
			icon: '🌾',
			checkPlacement: combine(
				noneOfType('quarry'),
				atLeastOneOfType('meadow', 'road', 'town'),
			),
			scoreContributors: neighborFetch(ofType('field', 'meadow')),
			groups: ['land', 'agriculture'],
			color: '#a4a65b',
			tile: grassTexture,
		},
	},
	{
		ponderation: .5,
		proto: {
			name: 'meadow',
			icon: '🐑',
			checkPlacement: atLeastOneOfType('meadow', 'road', 'town'),
			scoreContributors: floodFetch(ofType('meadow', 'field')),
			groups: ['land', 'agriculture'],
			color: '#42c56c',
			tile: grassTexture,
		},
	},
	{
		ponderation: 1,
		proto: {
			name: 'forest',
			icon: '🌳',
			checkPlacement: atLeastOneOfType('meadow', 'forest', 'field', 'road'),
			scoreContributors: mergeContribution(
				floodFetch(ofType('meadow', 'field')),
				neighborFetch(neighbor => neighbor === undefined),
			),
			multiplier: countEmpty(),
			groups: ['land', 'natural'],
			color: '#11672d',
			tile: grassTexture,
		},
	},
	{
		ponderation: .5,
		proto: {
			name: 'quarry',
			icon: '🪨',
			checkPlacement: combine(
				atLeastOneOfType('road'),
				atLeastOneOfType('meadow', 'forest'),
				noneOfType('town'),
			),
			scoreContributors: neighborFetch(ofType('field', 'meadow', 'bank')),
			baseScore: 2,
			groups: ['building', 'land'],
			color: '#5a7175',
			tile: grassTexture,
		},
	},
	{
		ponderation: .5,
		proto: {
			name: 'river',
			icon: '🌊',
			baseScore: 1,
			multiplier: countType('river'),
			scoreContributors: floodFetch(ofGroup('land'), 5),
			scoreContribution: 1,
			groups: ['land', 'natural'],
			color: '#369ad1',
			tile: {
				url: waterUrl,
				display: "connected",
			},
		}
	},
	{
		ponderation: 1,
		proto: {
			name: 'town',
			icon: '🏘️',
			checkPlacement: atLeastOneOfType('town', 'road'),
			scoreContributors: mergeContribution(
				limitContribution(floodFetch(ofType('town', 'bank'), 5), 5, 3),
				neighborFetch(ofGroup('land')),
			),
			groups: ['building'],
			color: '#876625',
			tile: cobblestoneTexture,
		},
	},
	{
		ponderation: .2,
		proto: {
			name: 'brickFactory',
			icon: '🧱',
			checkPlacement: combine(
				atLeastOneInGroup('building'),
				noneOfType('brickFactory'),
			),
			scoreContributors: floodFetch(ofType('town'), 5),
			multiplier: (neighbors): number => countType('brickFactory')(neighbors) > 0 ? 0 : 1,
			groups: ['building'],
			color: '#8a5f34',
			tile: cobblestoneTexture,
		},
	},
	{
		ponderation: .05,
		proto: {
			name: 'bank',
			icon: '🪙',
			checkPlacement: combine(
				atLeastOneOfType('town'),
				noneOfType('quarry', 'brickFactory'),
			),
			scoreContributors: neighborFetch(ofType('town')),
			scoreContribution: 2,
			bonus: ({name}): number => name === 'town' ? 1 : 0,
			baseScore: 4,
			multiplier: countType('town'),
			groups: ['building'],
			color: '#a5af5e',
			tile: cobblestoneTexture,
		},
	},
] satisfies CardDescriptor[];

/**
 * Register all the predefined cards
 * @param register the register function to use for each card
 */
export function registerAllCards(register: (card: CardDescriptor) => void): void {
	cards.forEach(card => register(card));
}