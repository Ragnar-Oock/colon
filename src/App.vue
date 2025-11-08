<script setup lang="ts">
import { registerAllCards } from "./cards.data";
import BoardView from "./components/board-view.vue";
import DraggedItem from "./components/dragged-item.vue";
// import AddResourceForm from "./components/add-resource-form.vue";
// import ConsumeResource from "./components/consume-resource.vue";
import HandDisplay from "./components/hand-display.vue";
import HarvestResources from "./components/harvest-resources.vue";
import ResourcePile from "./components/resource-pile.vue";
import { iter } from "./helpers/iterator.helper";
import { useDeckStore } from "./stores/deck.store";
import { GridVec, useGridStore } from "./stores/grid.store";

const grid = useGridStore();

const deckStore = useDeckStore();
registerAllCards(deckStore.register);

function initialiseGridAtRandom() {
	for (let x = 0; x < 10; x++) {
		for (let y = 0; y < 10; y++) {
			grid.setCell({
				position: {x, y} as GridVec,
				card: deckStore.pick().create(),
			});
		}
	}
}

// initialiseGridAtRandom();

</script>

<template>
	<!--	<add-resource-form/>-->
	<!--	<consume-resource/>-->
	<board-view/>
	<div class="ui">
		<harvest-resources/>
		<hand-display/>
		<resource-pile/>
	</div>
	<dragged-item/>

</template>

<style scoped>
.ui {
	position: fixed;
	bottom: 0;
}
</style>
