import { defineStore } from "pinia";
import { computed, reactive } from "vue";

export interface ResourceMultiplier {
	// ????
}

export interface Resource {
	type: ResourceType;
	amount: ResourceAmount;
	trigger: ResourceTrigger;
	id: number;
	multiplier: ResourceMultiplier;
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
let ids = 0;

export const useResourceStore = defineStore('resources', () => {
	const resources = reactive<Resource[]>([]);

	function consume(cost: Cost[]): void {
		return cost
			.forEach(({type, amount}) => consumeResource(type, amount))
	}

	function consumeResource(type: ResourceType, amount: number): boolean {
		if (availability.value[type] < amount) {return false;}
		if (amount === 0) {return true;}

		let consumeFrom = resources
			.values()
			.filter(resource => resource.type === type)
			.toArray();

		let consumed = 0;
		for (const resource of consumeFrom) {
			const leftToConsume = amount - consumed;

			consumed += (
				resource.amount >= leftToConsume
					? leftToConsume
					: resource.amount
			);

			resource.amount = (
				resource.amount >= leftToConsume
					? resource.amount - leftToConsume
					: 0) as ResourceAmount;

			if (amount - consumed === 0) {return true;}
		}

		throw new Error(`not enough ${type} resources but we failed to check for it.`)
	}

	function canConsume(cost: Cost[]): boolean {
		return cost
			.every(({type, amount}) => availability.value[type] >= amount)
	}

	function harvest(trigger: ResourceTrigger): void {
		resources
			.values()
			.filter(resource => resource.trigger === trigger)
			.forEach(resource => resource.amount += Number(resource.amount < RESOURCE_MAX))
	}

	function add(type: ResourceType, trigger: ResourceTrigger) {
		resources.push({
			amount: 0,
			trigger,
			type,
			id: ids++,
			multiplier: 1
		})
	}

	const availability = computed<Record<ResourceType, number>>(() => {
			return Object.fromEntries(resourceTypes
				.map(type => [
					type,
					resources
						.filter(resource => resource.type === type)
						.reduce((acc, {amount}) => acc + amount as number, 0)
				] as const)
			) as Record<ResourceType, number>;
		}
	)

	return {
		resources,
		availability,
		consume,
		canConsume,
		harvest,
		add
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