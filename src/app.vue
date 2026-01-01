<script setup lang="ts">
	import { registerAllCards } from "./cards.data";
	import BoardView from "./components/board-view.vue";
	import DraggedItem from "./components/dragged-item.vue";
	import HandDisplay from "./components/hand-display.vue";
	import { card } from "./helpers/card.helper";
	import { useAutoSave } from "./helpers/save/auto-save.composable";
	import { forgetHand } from "./helpers/save/save-hand.helper";
	import { forgetMap } from "./helpers/save/save-map.helper";
	import { useDeckStore } from "./stores/deck.store";
	import type { GridVec } from "./stores/grid.store";
	import { cell, gridVec, useGridStore } from "./stores/grid.store";
	import { useScoreStore } from "./stores/score.store";

	const deckStore = useDeckStore();
	registerAllCards(deckStore.register);
	const score = useScoreStore();
	const grid = useGridStore();

	/**
	 * Initialize a square `size` by `size` large were all cells are filed at random from the deck, placement checks are not performed.
	 * Used for debug purpose only, DO NOT use for any other purpose.
	 * @param size how large of an initialization area we want.
	 */
	function initialiseGridAtRandom(size: number): void {
		for (let x = 0; x < size; x++) {
			for (let y = 0; y < size; y++) {
				grid.setCell({
					position: {x, y} as GridVec,
					card: card(deckStore.pick().proto),
				});
			}
		}
	}

	/**
	 * Reset the map and reload the game.
	 */
	function newGame(): void {
		forgetMap(0);
		forgetHand(0);
		window.location.reload();
	}

	const townProto = deckStore.registry.get('town')?.proto;
	if (townProto === undefined) {
		throw new Error('Default tile type not available. Did you fuck up the load order ?');
	}
	useAutoSave({
		slot: 0,
		newMap: () => [
			cell(gridVec(0, 0), card(townProto)),
		],
	});

</script>

<template>
	<board-view/>
	<div class="ui">
		{{ score.score }}

		<!--		<harvest-resources/>-->
		<button @click="newGame">new game</button>
		<hand-display/>
	</div>
	<dragged-item/>

</template>

<style scoped>
	.ui {
		position: fixed;
		bottom: 0;
		width: 100%;
	}
</style>
