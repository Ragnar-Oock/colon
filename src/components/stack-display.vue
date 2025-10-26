<script setup lang="ts">
import { CardInstance } from "../stores/deck.store";
import HandCard from "./hand-card.vue";

defineProps<{
	stack: CardInstance[]
}>()
</script>

<template>
	<div class="stack">
		<HandCard
				v-for="card in stack"
				:key="card.id"
				:card
		/>
	</div>
</template>

<style scoped>
	.stack {
		display: grid;
	}
</style>