import { pick } from "./math.helper";
import { CardDescriptor } from "./stores/deck.store";
import { ResourceCard, resourceTriggers } from "./stores/resource.store";

export const cards = [
	{
		ponderation: 1,
		create: () => ({
			cost: [
				{type: "brick", amount: 3},
				{type: 'wood', amount: 2}
			],
			name: 'town',
			icon: '🏘️',
			id: crypto.randomUUID(),
		}),
	},
	{
		ponderation: 1,
		create: () => ({
			cost: [
				{type: 'brick', amount: 2},
				{type: 'wood', amount: 1},
			],
			name: 'road',
			icon: '🛣️',
			id: crypto.randomUUID(),
		}),
	},
	{
		ponderation: .5,
		create: () => ({
			cost: [
				{type: 'rock', amount: 2},
				{type: 'wood', amount: 1},
			],
			name: 'brick factory',
			icon: '🧱',
			id: crypto.randomUUID(),
			resourceType: "brick",
			trigger: pick(resourceTriggers),
			multiplier: 1
		}),
	},
	{
		ponderation: .5,
		create: () => ({
			cost: [
				{type: 'wood', amount: 1},
			],
			name: 'mine',
			icon: '🪙',
			id: crypto.randomUUID(),
			resourceType: "gold",
			trigger: pick(resourceTriggers),
			multiplier: 1
		}),
	},
	{
		ponderation: .5,
		create: (): ResourceCard => ({
			cost: [
				{type: 'wood', amount: 1},
			],
			name: 'quarry',
			icon: '🪨',
			id: crypto.randomUUID(),
			resourceType: "rock",
			trigger: pick(resourceTriggers),
			multiplier: 1
		}),
	},
	{
		ponderation: .5,
		create: () => ({
			cost: [
				{type: 'rock', amount: 2},
				{type: 'wood', amount: 1},
			],
			name: 'Field',
			icon: '🌾',
			id: crypto.randomUUID(),
			resourceType: "wheat",
			trigger: pick(resourceTriggers),
			multiplier: 1
		}),
	},
	{
		ponderation: .5,
		create: () => ({
			cost: [
				{type: 'rock', amount: 2},
				{type: 'wood', amount: 1},
			],
			name: 'Forest',
			icon: '🌳',
			id: crypto.randomUUID(),
			resourceType: "wood",
			trigger: pick(resourceTriggers),
			multiplier: 1
		}),
	},
	{
		ponderation: .5,
		create: () => ({
			cost: [
				{type: 'rock', amount: 2},
				{type: 'wood', amount: 1},
			],
			name: 'Field',
			icon: '🐑',
			id: crypto.randomUUID(),
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