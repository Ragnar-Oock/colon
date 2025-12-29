<script setup lang="ts">
	import type { CardInstance } from "../helpers/card.helper";
	import HandCard from "./hand-card.vue";

	defineProps<{
		stack: CardInstance[]
	}>()
</script>

<template>
	<div class="stack">
		<div v-for="card in stack"
				 :key="card.id"
				 class="item">
			<HandCard
				:card
			/>
		</div>
	</div>
</template>

<style scoped>
	.stack {
		display: grid;
		align-content: start;
		grid-auto-rows: 2.5em;
		grid-auto-columns: 30ch;
		place-content: start;

		& > .item {
			height: auto;
		}
	}
</style>