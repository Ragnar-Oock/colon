<script setup lang="ts">

import { pick } from "../math.helper";
import { ResourceTrigger, resourceTriggers, ResourceType, resourceTypes, useResourceStore } from "../resource.store";
import { ref, useId } from "vue";

const typeId = useId();
const triggerId = useId();

const type = ref<ResourceType|undefined>(undefined);
const trigger = ref<ResourceTrigger|undefined>(undefined);

const resourceStore = useResourceStore();

function addResource() {
	if (!type.value || !trigger.value) return;

	resourceStore.add(type.value, trigger.value);
	type.value = undefined;
	trigger.value = undefined;
}

function addRandomResource() {
	resourceStore.add(
			pick(resourceTypes),
			pick(resourceTriggers),
	)
}
</script>

<template>
	<form action="#" @submit.prevent="addResource">
		<label :for="typeId">type</label>
		<select name="type" :id="typeId" v-model="type">
			<option
					v-for="resourceType in resourceTypes"
					:key="resourceType"
					:value="resourceType">{{resourceType}}</option>
		</select>

		<label :for="triggerId">trigger</label>
		<select name="type" :id="triggerId" v-model="trigger">
			<option
					v-for="resourceTrigger in resourceTriggers"
					:key="resourceTrigger"
					:value="resourceTrigger">{{resourceTrigger}}</option>
		</select>

		<button type="submit">add</button>
		<button type="button" @click="addRandomResource">add random resource</button>
	</form>
</template>

<style scoped>

</style>