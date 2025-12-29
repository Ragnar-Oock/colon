<script setup lang="ts">
	import { computed } from "vue";
	import type { BuildingType } from "../stores/building.store";
	import { useBuildingStore } from "../stores/building.store";
	import { useResourceStore } from "../stores/resource.store";
	import CostDisplay from "./cost-display.vue";

	const buildingStore = useBuildingStore();
	const resourceStore = useResourceStore();

	const {buildingType} = defineProps<{
		buildingType: BuildingType
	}>()

	const canBuild = computed(() => resourceStore.canConsume(buildingType.cost));

	function build() {
		if (!canBuild.value) {
			return;
		}

		buildingStore.build(buildingType);
	}


</script>

<template>
	<div>
		<button
			type="button"
			:aria-disabled="!canBuild"
			@click="build"
		>build {{ buildingType.name }}
		</button>
		<CostDisplay :cost="buildingType.cost"/>
	</div>
</template>

<style scoped>

	[aria-disabled=true] {
		opacity: .6;
	}
</style>