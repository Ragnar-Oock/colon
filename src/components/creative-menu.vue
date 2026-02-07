<script setup lang="ts">
	import { ref, watchEffect } from "vue";
	import { card } from "../domains/card/card.helper";
	import { useDeckStore } from "../stores/deck.store";

	const deck = useDeckStore();

	const activeCard = ref(undefined);

	watchEffect(() => {
		if (activeCard.value === undefined) {
			return;
		}
		const active = deck.registry.get(activeCard.value);
		if (active === undefined) {
			return;
		}
		deck.active = card(active.proto);
	})

</script>

<template>
	<div role="menu">
		<label
			class="card"
			v-for="({proto}) in deck.deck"
			:key="proto.name"
			:for="`card:${proto.name}`"
		>
			{{ proto.icon }} {{ proto.name }}
			<input type="radio" name="cardType" :id="`card:${proto.name}`" v-model="activeCard" :value="proto.name">
		</label>
	</div>
</template>

<style scoped>
	[role=menu] {
		display: flex;

		label {
			padding: 1ch;

			&:has(input:checked) {
				outline: #56a9b1 2px solid;
				outline-offset: -2px;
			}
		}
	}
</style>