<script setup lang="ts">
	import { useEventListener } from "@vueuse/core";
	import { computed } from "vue";
	import { useDeckStore } from "../stores/deck.store";
	import { useDraggableStore } from "../stores/draggable.store";
	import HandCard from "./hand-card.vue";

	const deckStore = useDeckStore();

	const hand = computed(() => deckStore
		.idleHand
		.sort((a, b) => a.name.localeCompare(b.name))
	)

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
		<div class="stacks">
			<HandCard
				v-for="(card, index) in hand"
				:key="card.id"
				:card
				:index
			/>
		</div>
	</div>
</template>

<style scoped>
	.stacks {
		display: grid;
		grid: 100% / auto-flow 25ch;
		gap: .25em;
		margin-inline: auto;
		width: min-content;
	}
</style>