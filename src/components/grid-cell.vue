<script lang="ts" setup>
	import { computed } from "vue";
	import { FilledCell } from "../stores/grid.store";

	const {
		cell
	} = defineProps<{
		cell: FilledCell
	}>();

	// offset the position to put the grid's top left most cell in the 1 / 1 css grid cell
	const x = computed(() => cell.position.x + 1);
	const y = computed(() => cell.position.y + 1);
</script>

<template>
	<div class="board-card">
		<div class="icon">{{ cell.card?.icon }}</div>
		<span
			v-if="cell.card?.trigger !== undefined"
			class="trigger"
			title="trigger harvest on :"
		>{{ cell.card?.trigger }}</span>
	</div>
</template>

<style scoped>
	.board-card {
		grid-area: v-bind(y) / v-bind(x);
		position: relative;
		user-select: none;

		.icon {
			font-size: 5em;
			pointer-events: none;
		}

		.trigger {
			position: absolute;
			top: 0;
			left: 0;
			min-width: 3ch;
			height: 3ch;
			text-align: center;

			background: #2c3e50;
			border-radius: 100%;
		}
	}
</style>