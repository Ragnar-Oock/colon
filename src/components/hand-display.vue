<script setup lang="ts">
	import { useEventListener } from "@vueuse/core";
	import { computed, onMounted, ref } from "vue";
	import { useDeckStore } from "../stores/deck.store";
	import { useDraggableStore } from "../stores/draggable.store";
	import HandCard from "./hand-card.vue";

	const deckStore = useDeckStore();

	const draggable = useDraggableStore();
	const maxDisplayed = ref(0);
	const hand = computed(() => deckStore.hand.slice(0, maxDisplayed.value));

	useEventListener('keyup', event => {
		if (event.key === 'Escape') {
			draggable.cancel();
		}
	});

	const increaseHandSize = () => setTimeout(() => {
		maxDisplayed.value++;
		if (maxDisplayed.value < deckStore.hand.length) {
			increaseHandSize();
		}
	}, 200);

	onMounted(() => {
		increaseHandSize();
	})
</script>

<template>
	<div
		class="hand"
		@drop.prevent="draggable.cancel()"
		@dragover.prevent
	>
		<HandCard
			v-for="(card) in hand"
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