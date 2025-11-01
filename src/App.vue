<script setup lang="ts">
import { registerAllCards } from "./cards.data";
import AddResourceForm from "./components/add-resource-form.vue";
import ConsumeResource from "./components/consume-resource.vue";
import GridDisplay from "./components/grid-display.vue";
import HandDisplay from "./components/hand-display.vue";
import HarvestResources from "./components/harvest-resources.vue";
import { useDeckStore } from "./stores/deck.store";
const deckStore = useDeckStore();
registerAllCards(deckStore.register);

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
