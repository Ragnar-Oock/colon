import { defineStore } from "pinia";
import { reactive } from "vue";
import type { Cost } from "./resource.store";
import { useResourceStore } from "./resource.store";


export type BuildingName = string;

export interface BuildingType {
	name: BuildingName;
	cost: Cost[];
	icon: string;
}

export interface BuildingSlot {
	content: Building | undefined;
}

export interface Building {
	type: BuildingType;
	slots: BuildingSlot[];
	id: number;
}

let ids = 0;

export const useBuildingStore = defineStore('building', () => {
	const buildings = reactive<Building[]>([]);

	const resourceStore = useResourceStore();

	function build(type: BuildingType): boolean {
		if (!resourceStore.canConsume(type.cost)) {
			return false;
		}

		resourceStore.consume(type.cost);

		buildings.push({
			type: type,
			slots: [],
			id: ids++,
		})

		return true;
	}

	return {
		build,
		buildings
	}
})