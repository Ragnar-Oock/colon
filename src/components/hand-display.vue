<script setup lang="ts">
	import { useEventListener } from "@vueuse/core";
	import { useDeckStore } from "../stores/deck.store";
	import { useDraggableStore } from "../stores/draggable.store";
	import HandCard from "./hand-card.vue";

	const deckStore = useDeckStore();

	const draggable = useDraggableStore();

	useEventListener('keyup', event => {
		if (event.key === 'Escape') {
			draggable.cancel();
		}
	})
</script>

<template>
	<div
		class="hand"
		@drop.prevent="draggable.cancel()"
		@dragover.prevent
	>
		<HandCard
			v-for="(card) in deckStore.hand"
			:key="card.id"
			:card
		/>
	</div>
</template>

<style scoped>
	.hand {
		display: grid;
		grid: 100% / auto-flow 25ch;
		gap: .25em;
		margin-inline: auto;
		width: min-content;
	}
</style>