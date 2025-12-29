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
				class="requirement"
				v-for="({type, amount}) in cost"
				:key="type"
				:title="`${amount} ${type}`"
				:class="{'is-enough': resourceStore.resources[type] > amount}"
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