<script setup lang="ts">
	import { watchDebounced } from "@vueuse/core";
	import { ref } from "vue";
	import { pick } from "../math.helper";
	import type { ResourceTrigger } from "../stores/resource.store";
	import { resourceTriggers, useResourceStore } from "../stores/resource.store";

	const resourceStore = useResourceStore();

	const trigger = ref<ResourceTrigger | undefined>();
	const show = ref(false);

	function harvest() {
		//todo check if this pick randomly enough
		trigger.value = pick(resourceTriggers);
		resourceStore.harvest(trigger.value);
		show.value = true;
	}

	watchDebounced(show, () => {
		if (show.value) {
			show.value = false;
		}
	}, {debounce: 1000, maxWait: 99_999_999});

</script>

<template>
	<button type="button" @click="harvest">harvest</button>
	<span v-show="show">harvested resource triggered by {{ trigger }}</span>
</template>

<style scoped>

</style>