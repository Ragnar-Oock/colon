import { pick } from "./math.helper";
import { CardDescriptor } from "./stores/deck.store";
import { card, ResourceCard, resourceTriggers } from "./stores/resource.store";

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
			multiplier: 1
		}),
	},
	{
		ponderation: .5,
		create: () => card<ResourceCard>({
			cost: [
				{type: 'wood', amount: 1},
			],
			name: 'mine',
			icon: '🪙',
			resourceType: "gold",
			trigger: pick(resourceTriggers),
			multiplier: 1
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
			multiplier: 1,
		}),
	},
	{
		ponderation: .5,
		create: () => card<ResourceCard>({
			cost: [
				{type: 'rock', amount: 2},
				{type: 'wood', amount: 1},
			],
			name: 'Field',
			icon: '🌾',
			resourceType: "wheat",
			trigger: pick(resourceTriggers),
			multiplier: 1
		}),
	},
	{
		ponderation: .5,
		create: () => card<ResourceCard>({
			cost: [
				{type: 'rock', amount: 2},
				{type: 'wood', amount: 1},
			],
			name: 'Forest',
			icon: '🌳',
			resourceType: "wood",
			trigger: pick(resourceTriggers),
			multiplier: 1
		}),
	},
	{
		ponderation: .5,
		create: () => card<ResourceCard>({
			cost: [
				{type: 'rock', amount: 2},
				{type: 'wood', amount: 1},
			],
			name: 'Field',
			icon: '🐑',
			resourceType: "wool",
			trigger: pick(resourceTriggers),
			multiplier: 1
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