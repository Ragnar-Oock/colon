<script setup lang="ts">

import { computed } from "vue";
import { CardInstance } from "../stores/deck.store";
import { RESOURCE_MAX, useResourceStore } from "../stores/resource.store";
import CostDisplay from "./cost-display.vue";


const {card} = defineProps<{
	card: CardInstance,
}>()

const resourceStore = useResourceStore()

const isPlacable = computed(() => resourceStore.canConsume(card.cost))
</script>

<template>
	<div class="card" :class="{placable: isPlacable}">
			<p>{{card.icon}} {{ card.name }}</p>
			<CostDisplay :cost="card.cost"/>
	</div>
</template>

<style scoped>

</style>