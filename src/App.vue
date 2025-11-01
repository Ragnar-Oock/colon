<script setup lang="ts">
import { registerAllCards } from "./cards.data";
import AddResourceForm from "./components/add-resource-form.vue";
import ConsumeResource from "./components/consume-resource.vue";
import GridDisplay from "./components/grid-display.vue";
import HandDisplay from "./components/hand-display.vue";
import HarvestResources from "./components/harvest-resources.vue";
import { useDeckStore } from "./stores/deck.store";
import { useGridStore } from "./stores/grid.store";

const grid = useGridStore();

const deckStore = useDeckStore();
registerAllCards(deckStore.register);

function initialiseGridAtRandom() {
	for (let x = 0; x < 10; x++) {
		for (let y = 0; y < 10; y++) {
			grid.setCell({
				position: {x, y},
				card: deckStore.pick().create(),
			});
		}
	}
}

initialiseGridAtRandom();

</script>

<template>
	<add-resource-form/>
	<harvest-resources/>
	<consume-resource/>
	<hand-display/>

	<grid-display/>
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
