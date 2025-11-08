import emitter, { EventHandlerMap } from "mitt";
import { defineStore } from "pinia";
import { reactive } from "vue";
import { CardHooks, CardInstance } from "./deck.store";
import { FilledCell, useGridStore } from "./grid.store";


export interface Resource {
	type: ResourceType;
	amount: ResourceAmount;
}

export type ResourceAmount = typeof resourceAmounts[number];
export type ResourceTrigger = typeof resourceTriggers[number];
export type ResourceType = typeof resourceTypes[number];

export type Cost = {
	type: ResourceType;
	amount: number;
}

export const resourceTypes = [
	'rock',
	'wheat',
	'gold',
	'brick',
	'wood',
	'wool',
] as const;

export const resourceTriggers = [1, 2, 3, 4, 5, 6] as const;
export const resourceAmounts = [0, 1, 2, 3] as const;

export const RESOURCE_MAX = 3;

export interface ResourceCard extends CardInstance {
	resourceType: ResourceType,
	multiplier: number,
}

export type ProtoCard<card extends CardInstance> = Omit<card, 'id' | 'hooks'>

export function card<card extends CardInstance>(proto: ProtoCard<card>, hooks?: EventHandlerMap<CardHooks>): card {
	return {
		...proto,
		id: crypto.randomUUID(),
		hooks: emitter(hooks)
	} as card
}

export const useResourceStore = defineStore('resources', () => {
	const grid = useGridStore();
	const resources = reactive<Record<ResourceType, number>>(Object.fromEntries(resourceTypes.map(type => ([type, 0]))) as Record<ResourceType, number>);

	function consume(...cost: Cost[]): void {
		return cost
			.forEach(({type, amount}) => consumeResource(type, amount))
	}

	function consumeResource(type: ResourceType, amount: number): boolean {
		throw new Error(`no`)
	}

	function canConsume(...cost: Cost[]): boolean {
		return cost
			.every(({type, amount}) => resources[type] >= amount)
	}

	const resourceCells = grid.filterCells(
		(cell): cell is FilledCell<ResourceCard> =>
			(resourceTypes as unknown as (string | undefined)[])
				.includes((cell.card as ResourceCard).resourceType)
	)

	function harvest(trigger: ResourceTrigger): void {
		resourceCells
			.value
			.forEach(({card}) => {
				if (trigger !== card.trigger) {
					return;
				}

				resources[card.resourceType] += card.multiplier;
			})
	}

	return {
		resources,
		resourceCells,
		consume,
		canConsume,
		harvest,
	}
})

export const typeIcons = {
	brick: '🧱',
	gold: '🪙',
	rock: '🪨',
	wheat: '🌾',
	wood: '🌳',
	wool: '🐑'
} satisfies Record<ResourceType, string>


export function getResourceIcon(type: ResourceType): string {
	return typeIcons[type];
}

export function getPonderatedCost(cost: Cost[]): number {
	return cost.reduce((acc, {amount}) => acc + amount, 0)
}