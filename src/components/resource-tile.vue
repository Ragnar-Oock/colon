<script setup lang="ts">

import { computed, useId } from "vue";
import { Resource, RESOURCE_MAX, ResourceAmount, ResourceType } from "../resource.store";

const id = useId();
const {resource} = defineProps<{
	resource: Resource;
}>()

const typeIcons = {
	brick: '🧱',
	gold: '🪙',
	iron: '🔩',
	wheat: '🌾',
	wood: '🌳',
	wool: '🐑'
} satisfies Record<ResourceType, string>

const icon = computed(() => typeIcons[resource.type])
</script>

<template>
<div class="tile resource">
	<label :for="id">{{icon}} {{ resource.type }}</label>
	<meter :id min="0" max="3" :value="resource.amount">{{resource.amount}}/{{RESOURCE_MAX}}</meter> <span>{{resource.amount}}/{{RESOURCE_MAX}}</span> <span class="trigger" title="triggered by">{{resource.trigger}}</span>
</div>
</template>

<style scoped>

</style>