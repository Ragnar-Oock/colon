<script setup lang="ts">

	import type { Cost } from "../stores/resource.store";
	import { getResourceIcon, useResourceStore } from "../stores/resource.store";

	defineProps<{
		cost: Cost[],
	}>();

	const resourceStore = useResourceStore();
</script>

<template>
	<div class="cost">
		<span
			v-for="({type, amount}) in cost"
			:key="type"
			:class="{'is-enough': resourceStore.resources[type] > amount}"
			:title="`${amount} ${type}`"
			class="requirement"
		>{{ getResourceIcon(type) }} {{ resourceStore.resources[type] }} / {{ amount }}</span>
	</div>
</template>

<style scoped>
	.requirement {
		&:not(.is-enough) {
			filter: saturate(60%);
		}
	}
</style>