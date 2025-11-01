<script setup lang="ts">

import { computed } from "vue";
import { CardInstance, useDeckStore } from "../stores/deck.store";
import { useResourceStore } from "../stores/resource.store";
import CostDisplay from "./cost-display.vue";


const {card} = defineProps<{
	card: CardInstance,
}>()

const resourceStore = useResourceStore()
const deckStore = useDeckStore();

const isPlacable = computed(() => resourceStore.canConsume(card.cost))
const isActive = computed(() => deckStore.active === card);
function select() {
	deckStore.active = card;
}
</script>

<template>
	<div class="card" :class="{placable: isPlacable, active: isActive}" @click="select">
			<p>{{card.icon}} {{ card.name }}</p>
			<CostDisplay :cost="card.cost"/>
	</div>
</template>

<style scoped>
	.card {
		&:not(.placable) {
			opacity: .8;
		}
		/* todo use aria stuff instead */
		&.active {
			outline: solid 1px black;
			outline-offset: 1px;
		}
	}
</style>