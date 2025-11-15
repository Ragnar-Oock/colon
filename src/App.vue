<script setup lang="ts">
	import { onMounted } from "vue";
	import { registerAllCards } from "./cards.data";
	import BoardView from "./components/board-view.vue";
	import DraggedItem from "./components/dragged-item.vue";
	import HandDisplay from "./components/hand-display.vue";
	import HarvestResources from "./components/harvest-resources.vue";
	import { card } from "./helpers/card.helper";
	import { iter } from "./helpers/iterator.helper";
	import { useDeckStore } from "./stores/deck.store";
	import { GridVec, useGridStore } from "./stores/grid.store";
	import { useScoreStore } from "./stores/score.store";

	const deckStore = useDeckStore();
	registerAllCards(deckStore.register);
	const score = useScoreStore();
	const grid = useGridStore();

	function initialiseGridAtRandom(size: number) {
		for (let x = 0; x < size; x++) {
			for (let y = 0; y < size; y++) {
				grid.setCell({
					position: {x, y} as GridVec,
					card: card(deckStore.pick().proto),
				});
			}
		}
	}

	function initializeHandAtRandom(amount: number) {
		iter(amount)
			.forEach(() => deckStore.draw())
	}

	onMounted(() => {
		// initialiseGridAtRandom(5);
		initializeHandAtRandom(21);
	})
</script>

<template>
	<board-view/>
	<div class="ui">
		{{ score.score }}

		<harvest-resources/>
		<hand-display/>
	</div>
	<dragged-item/>

</template>

<style scoped>
	.ui {
		position: fixed;
		bottom: 0;
	}
</style>
