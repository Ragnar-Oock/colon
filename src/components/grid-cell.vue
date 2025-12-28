<script lang="ts" setup>
	import { FilledCell, GridVec } from "../stores/grid.store";

	const {
		cell
	} = defineProps<{
		cell: FilledCell & { visiblePosition: GridVec }
	}>();
</script>

<template>
	<div class="board-card">
		<div class="icon">{{ cell.card?.icon }}</div>
	</div>
</template>

<style scoped>
	.board-card {
		grid-area: v-bind('cell.visiblePosition.y') / v-bind('cell.visiblePosition.x');
		user-select: none;
		position: relative;
		display: grid;		
		place-content: center;

		.icon {
			font-size: 5em;
			pointer-events: none;
		}
	}
</style>