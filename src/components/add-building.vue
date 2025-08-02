<script setup lang="ts">
import { computed } from "vue";
import { BuildingType, useBuildingStore } from "../building.store";
import { useResourceStore } from "../resource.store";

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
<button
		type="button"
		:aria-disabled="!canBuild"
		@click="build"
>build {{buildingType.name}}</button>
</template>

<style scoped>

[aria-disabled=true] {
	opacity: .6;
}
</style>