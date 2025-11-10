import { card, CardDescriptor, CardInstance } from "./helpers/card.helper";
import { combine, expectAtLeast, expectNone } from "./helpers/neighborhood-predicate.helper";
import { countType } from "./helpers/score-multiplier.helper";
import { ofType, sameType } from "./helpers/score-predicate";
import { pick } from "./math.helper";
import { FilledCell } from "./stores/grid.store";
import { ResourceCard, resourceTriggers } from "./stores/resource.store";

export type CardType = CardInstance["name"];


export const cards = [
	{
		ponderation: 1,
		create: () => card({
			cost: [
				{type: "brick", amount: 3},
				{type: 'wood', amount: 2}
			],
			name: 'town',
			icon: '🏘️',
			checkNeighbors: expectAtLeast('town', 'road'),
			scoreContributors: (placement, {floodFetch}) =>
				floodFetch(placement, sameType('town')) as FilledCell[],
			multiplier: countType('town')
		}),
	},
	{
		ponderation: 1,
		create: () => card({
			cost: [
				{type: 'brick', amount: 2},
				{type: 'wood', amount: 1},
			],
			name: 'road',
			icon: '🛣️',
			scoreContributors: () => []
		}),
	},
	{
		ponderation: .5,
		create: () => card<ResourceCard>({
			cost: [
				{type: 'rock', amount: 2},
				{type: 'wood', amount: 1},
			],
			name: 'brick factory',
			icon: '🧱',
			resourceType: "brick",
			trigger: pick(resourceTriggers),
			checkNeighbors: expectAtLeast('town'),
		}),
	},
	{
		ponderation: .5,
		create: () => card<ResourceCard>({
			cost: [
				{type: 'wood', amount: 1},
			],
			name: 'bank',
			icon: '🪙',
			resourceType: "gold",
			trigger: pick(resourceTriggers),
			checkNeighbors: expectAtLeast('town'),
			bonus: type => type === 'town' ? 1 : 0
		}),
	},
	{
		ponderation: .5,
		create: () => card<ResourceCard>({
			cost: [
				{type: 'wood', amount: 1},
			],
			name: 'quarry',
			icon: '🪨',
			resourceType: "rock",
			trigger: pick(resourceTriggers),
		}),
	},
	{
		ponderation: .5,
		create: () => card<ResourceCard>({
			cost: [
				{type: 'rock', amount: 2},
				{type: 'wood', amount: 1},
			],
			name: 'field',
			icon: '🌾',
			resourceType: "wheat",
			trigger: pick(resourceTriggers),
			checkNeighbors: combine(
				expectNone('quarry'),
				expectAtLeast('meadow', 'road', 'town'),
			)
		}),
	},
	{
		ponderation: .5,
		create: () => card<ResourceCard>({
			cost: [
				{type: 'rock', amount: 2},
				{type: 'wood', amount: 1},
			],
			name: 'forest',
			icon: '🌳',
			resourceType: "wood",
			trigger: pick(resourceTriggers),
		}),
	},
	{
		ponderation: .5,
		create: () => card<ResourceCard>({
			cost: [
				{type: 'rock', amount: 2},
				{type: 'wood', amount: 1},
			],
			name: 'meadow',
			icon: '🐑',
			resourceType: "wool",
			trigger: pick(resourceTriggers),
			checkNeighbors: expectAtLeast('meadow', 'road', 'town'),
			scoreContributors: (placement, {floodFetch}) =>
				floodFetch(placement, ofType('meadow', 'field')) as FilledCell[],
		}),
	},
] satisfies CardDescriptor[];

/**
 * Register all the predefined cards
 * @param register
 */
export function registerAllCards(register: (card: CardDescriptor) => void) {
	cards.forEach(card => register(card));
}