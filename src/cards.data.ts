import { pick } from "./math.helper";
import { CardDescriptor, CardInstance } from "./stores/deck.store";
import { Cell } from "./stores/grid.store";
import { card, ResourceCard, resourceTriggers } from "./stores/resource.store";

export type NeighborhoodPredicate = (neighborhood: Cell[]) => boolean;

export type CardType = CardInstance["name"];

/**
 * Check that at least one of the neighbors is of a required set of types
 * @param oneOf a set of types, at least one of which should be present at least once in the future neighbors
 * @returns is the neighborhood suitable ?
 */
const expectAtLeast = (...oneOf: CardType[]): NeighborhoodPredicate =>
	neighborhood =>
		neighborhood.some(neighbor => oneOf.includes(neighbor.card?.name!));

/**
 * Check that none of the neighbors is of a given set of types
 * @param of a set of types, none of which should be present in the future neighbors
 * @returns is the neighborhood suitable ?
 */
const expectNone = (...of: CardType[]): NeighborhoodPredicate => neighborhood =>
	!neighborhood.some(neighbor => of.includes(neighbor.card?.name!))

/**
 * Check that at least one of the neighbors is of a required set of type. Types are counted as a whole, to count each
 * type individually use multiple instances of {@link expectAtMost `expectAtMost()`} with {@link combine `combine()`}.
 * @param amount how many neighbors to expect
 * @param of a set of types that should be present at least `amount` times
 * @returns is the neighborhood suitable ?
 */
const expectAtMost = (amount: number, ...of: CardType[]): NeighborhoodPredicate =>
	neighborhood => neighborhood.reduce(
		(count, neighbor) => count + (of.includes(neighbor.card?.name!) ? 1 : 0),
		0
	) > amount;

/**
 * Combine multiple {@link NeighborhoodPredicate} into a single one, all of which should match.
 * @param predicates
 */
const combine = (...predicates: NeighborhoodPredicate[]): NeighborhoodPredicate =>
	neighborhood => predicates.every(predicate => predicate(neighborhood));

/**
 * Combine multiple {@link NeighborhoodPredicate} into a single one, at least one of which should match.
 * @param predicates
 */
const either = (...predicates: NeighborhoodPredicate[]): NeighborhoodPredicate =>
	neighborhood => predicates.some(predicate => predicate(neighborhood));

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
			multiplier: 1,
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
			multiplier: 1,
			checkNeighbors: expectAtLeast('town'),
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
			name: 'field',
			icon: '🌾',
			resourceType: "wheat",
			trigger: pick(resourceTriggers),
			multiplier: 1,
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
			name: 'meadow',
			icon: '🐑',
			resourceType: "wool",
			trigger: pick(resourceTriggers),
			multiplier: 1,
			checkNeighbors: expectAtLeast('meadow', 'road', 'town'),
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