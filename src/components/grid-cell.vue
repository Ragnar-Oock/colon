<script setup lang="ts">
import { FilledCell } from "../stores/grid.store";

const {
	cell
} = defineProps<{
	cell: FilledCell
}>()
</script>

<template>
<div class="board-card">
	<div class="icon">{{ cell.card?.icon }}</div>
</div>
</template>

<style scoped>
	.board-card {
		grid-area: v-bind('cell.position.y') / v-bind('cell.position.x');

		.icon {
			font-size: 5em;
			pointer-events: none;
			user-select: none;
		}
	}
</style>