<script setup lang="ts">

import { useEventListener } from "@vueuse/core";
import { computed } from "vue";
import { CardInstance, useDeckStore } from "../stores/deck.store";
import { useDraggableStore } from "../stores/draggable.store";
import { getPonderatedCost } from "../stores/resource.store";
import StackDisplay from "./stack-display.vue";

const deckStore = useDeckStore();

const stacks = computed(() => Object
		.values(Object.groupBy(deckStore.hand, ({name}) => name) as Record<string, CardInstance[]>)
		.sort(([a], [b]) => getPonderatedCost(a.cost) - getPonderatedCost(b.cost)));

const draggable = useDraggableStore();

useEventListener('keyup', event => {
	if (event.key === 'Escape') {
		draggable.cancel();
	}
})


</script>

<template>
	<div class="hand">
		<div>
			<button @click="deckStore.draw()">draw</button>
		</div>
		<div class="stacks">
			<StackDisplay v-for="stack in stacks" :stack/>
		</div>
	</div>
</template>

<style scoped>
.stacks {
	display: flex;
	gap: .25em;
}
</style>