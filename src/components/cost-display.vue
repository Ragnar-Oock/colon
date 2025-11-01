<script setup lang="ts">

import { Cost, getResourceIcon, useResourceStore } from "../stores/resource.store";
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
		>{{getResourceIcon(type)}} {{amount}} / {{resourceStore.resources[type]}}</span>
	</div>
</template>

<style scoped>

</style>