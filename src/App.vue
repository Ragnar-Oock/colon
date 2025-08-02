<script setup lang="ts">
import BuildingTile from "./components/building-tile.vue";
import ResourceTile from "./components/resource-tile.vue";
import AddResourceForm from "./components/add-resource-form.vue";
import {useResourceStore} from "./resource.store.js";
import HarvestResources from "./components/harvest-resources.vue";
import ConsumeResource from "./components/consume-resource.vue";
import AddBuilding from "./components/add-building.vue";
import { BuildingType, useBuildingStore } from "./building.store.js";

const resourceStore = useResourceStore();
const buildingStore = useBuildingStore();

const town = {
	cost: {
		brick: 3,
		wood: 2
	},
	name: 'town',
	icon: '🏘️'
} satisfies BuildingType;

</script>

<template>
	<add-resource-form/>
	<harvest-resources/>
	<consume-resource/>
  <main>
		<add-building :building-type="town"></add-building>

		<div class="resources grid">
			<resource-tile
					v-for="resource in resourceStore.resources"
					:key="resource.id"
					:resource
			></resource-tile>
		</div>

		<div class="buildings grid">
			<building-tile
					v-for="building in buildingStore.buildings"
					:key="building.id"
					:building
			></building-tile>
		</div>
  </main>
</template>

<style scoped>
.grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(15ch, 30ch));
}
main {
	width: 100%;
}
</style>
