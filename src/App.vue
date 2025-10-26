<script setup lang="ts">
import HandDisplay from "./components/hand-display.vue";
import BuildingTile from "./components/tiles/building-tile.vue";
import ResourceTile from "./components/tiles/resource-tile.vue";
import AddResourceForm from "./components/add-resource-form.vue";
import { useDeckStore } from "./stores/deck.store";
import {useResourceStore} from "./stores/resource.store";
import HarvestResources from "./components/harvest-resources.vue";
import ConsumeResource from "./components/consume-resource.vue";
import AddBuilding from "./components/add-building.vue";
import { BuildingType, useBuildingStore } from "./stores/building.store";

const resourceStore = useResourceStore();
const buildingStore = useBuildingStore();

const town = {
	cost: [
		{type: "brick", amount: 3},
		{type: 'wood', amount: 2}
	],
	name: 'town',
	icon: '🏘️'
} satisfies BuildingType;

const road = {
	cost: [
		{type: 'brick', amount: 2},
		{type: 'wood', amount: 1},
	],
	name: 'road',
	icon: '🛣️'
} satisfies BuildingType;

const deckStore = useDeckStore();
deckStore.register({
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
})
deckStore.register({
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
})

</script>

<template>
	<add-resource-form/>
	<harvest-resources/>
	<consume-resource/>
  <main>
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

		<hand-display/>
  </main>
</template>

<style scoped>
.grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(15ch, 30ch));
	gap: 1rem;
	padding: 1rem;
}
main {
	width: 100%;
}
</style>
