<script lang="ts" setup>
	import type { FilledCell } from "../domains/cell/cell";
	import { useVisibleCellPosition } from "../domains/cell/cell-position.composable";

	const {
		cell
	} = defineProps<{
		cell: FilledCell
	}>();

	const position = useVisibleCellPosition(cell.position)
</script>

<template>
	<div class="board-card">
		<div class="icon">{{ cell.card?.icon }}</div>
	</div>
</template>

<style scoped>
	.board-card {
		grid-area: v-bind('position.y') / v-bind('position.x');
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