import { toArray } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed, reactive, toValue } from "vue";

export interface Resource {
	type: ResourceType;
	amount: ResourceAmount;
	trigger: ResourceTrigger;
	id: number;
}
export type ResourceAmount = typeof resourceAmounts[number];
export type ResourceTrigger = typeof resourceTriggers[number];
export type ResourceType = typeof resourceTypes[number];

export const resourceTypes = [
	'iron',
	'wheat',
	'gold',
	'brick'
] as const;

export const resourceTriggers = [1, 2, 3, 4, 5, 6] as const;
export const resourceAmounts = [0, 1, 2, 3] as const;

export const RESOURCE_MAX = 3;
let ids = 0;

const testResources = [
	{"amount": 3, "trigger": 1, "type": "iron", "id": 0},
	{"amount": 3, "trigger": 2, "type": "iron", "id": 1},
	{"amount": 3, "trigger": 3, "type": "iron", "id": 2},
	{"amount": 3, "trigger": 4, "type": "iron", "id": 3},
	{"amount": 3, "trigger": 5, "type": "iron", "id": 4},
	{"amount": 3, "trigger": 6, "type": "iron", "id": 5}
] as Resource[]

export const useResourceStore = defineStore('resources', () => {
	const resources = reactive<Resource[]>(testResources);

	function consume(type: ResourceType, amount: number): boolean {
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
			);
		}
	)

	return {
		resources,
		availability,
		consume,
		harvest,
		add
	}
})

