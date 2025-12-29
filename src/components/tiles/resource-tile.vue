<script setup lang="ts">

	import { computed, useId } from "vue";
	import type { Resource } from "../../stores/resource.store";
	import { RESOURCE_MAX, typeIcons } from "../../stores/resource.store";

	const id = useId();
	const {resource} = defineProps<{
		resource: Resource;
	}>()

	const icon = computed(() => typeIcons[resource.type])
</script>

<template>
	<div class="tile resource">
		<label :for="id">{{ icon }} {{ resource.type }}</label>
		<meter :id :value="resource.amount" max="3" min="0">{{ resource.amount }}/{{ RESOURCE_MAX }}</meter>
		<span class="amount">{{ resource.amount }}/{{ RESOURCE_MAX }}</span>
		<span class="trigger" title="triggered by">{{ resource.trigger }}</span>
	</div>
</template>

<style scoped>
	.resource {
		display: grid;
		grid:
		'label amount' auto
		'bar bar' auto
		'trigger trigger' auto
	/ auto auto;

		padding: 1rem;
		gap: .5rem;
		background: #2c3e50;
		border-radius: 10px;

		label {
			grid-area: label;
			font-size: 1.5rem;
		}

		meter {
			grid-area: bar
		}

		.amount {
			grid-area: amount
		}

		.trigger {
			grid-area: trigger
		}
	}
</style>