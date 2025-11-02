<script setup lang="ts">

import { computed } from "vue";
import { CardDescriptor, CardInstance, useDeckStore } from "../stores/deck.store";
import { getPonderatedCost } from "../stores/resource.store";
import StackDisplay from "./stack-display.vue";

const deckStore = useDeckStore();

const hand: CardDescriptor[] = [];


const stacks = computed(() => Object
		.values<CardInstance[]>(Object.groupBy(deckStore.hand, ({name}) => name))
		.sort(([a], [b]) => getPonderatedCost(a.cost) - getPonderatedCost(b.cost)));

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
.stacks{
	display: flex;
	gap: .25em;
}
</style>