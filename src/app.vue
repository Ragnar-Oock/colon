<script setup lang="ts">
	import { useScoreStore } from "./domains/score/score.store";
	import { registerAllCards } from "./plugins/basic-cards/cards.data";
	import BoardView from "./plugins/board/board-view.vue";
	import { card } from "./plugins/deck/card.helper";
	import { useDeckStore } from "./plugins/deck/deck.store";
	import DraggedItem from "./plugins/dragged/dragged-item.vue";
	import { cell } from "./plugins/grid/cell";
	import type { GridVec } from "./plugins/grid/grid.store";
	import { gridVec, useGridStore } from "./plugins/grid/grid.store";
	import HandDisplay from "./plugins/hand/hand-display.vue";
	import { useAutoSave } from "./plugins/save/auto-save.composable";
	import { forgetHand } from "./plugins/save/save-hand.helper";
	import { forgetMap } from "./plugins/save/save-map.helper";

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
