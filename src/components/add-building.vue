<script setup lang="ts">
import { computed } from "vue";
import { BuildingType, useBuildingStore } from "../stores/building.store";
import { getResourceIcon, useResourceStore } from "../stores/resource.store";

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
	>build {{buildingType.name}}</button>
	<div class="requirements">
		<span
				class="requirement"
				v-for="(amount, type) in buildingType.cost"
				:key="type"
				:title="`${amount} ${type}`"
		>{{getResourceIcon(type)}} {{amount}} / {{resourceStore.availability[type]}}</span>
	</div>
</div>
</template>

<style scoped>

[aria-disabled=true] {
	opacity: .6;
}
</style>