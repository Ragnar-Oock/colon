<script setup lang="ts">

	import type { Building } from "../../stores/building.store";

	const {building} = defineProps<{
	building: Building
}>()
</script>

<template>
<div class="building tile">
	<span class="icon">{{building.type.icon}}</span>
	<span class="label">{{building.type.name}}</span>
</div>
</template>

<style scoped>
.building {
	display: grid;
	grid:
		'icon'
		'label';

	padding: 1rem;
	gap: .5rem;
	background: #2c3e50;
	border-radius: 10px;
	font-size: 1.5rem;

	.label{
		grid-area: label;
	}
	.icon {
		grid-area: icon;
	}
}
</style>