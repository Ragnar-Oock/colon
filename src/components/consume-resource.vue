<script setup lang="ts">

import { computed, ref, useId, watch } from "vue";
import { ResourceType, resourceTypes, useResourceStore } from "../stores/resource.store";

const resourceStore = useResourceStore();

const typeId = useId();
const amountId = useId();

const type = ref<ResourceType|undefined>(undefined);
const amount = ref<number>(0);

const available = computed<number>(() => type.value ? resourceStore.resources[type.value] : 0)

function consume() {
	if (!type.value || !amount.value) return;

	resourceStore.consume({
		type: type.value,
		amount: amount.value
	});

}
watch(available, () => {
	if (available.value < amount.value) {
		amount.value = available.value;
	}
})

</script>

<template>
	<form action="#" @submit.prevent="consume">
		<label :for="typeId">type</label>
		<select name="type" :id="typeId" v-model="type">
			<option
					v-for="resourceType in resourceTypes"
					:key="resourceType"
					:value="resourceType">{{resourceType}}</option>
		</select>

		<label :for="amountId">amount</label>
		<input type="range" :id="amountId" step="1" min="0" :max="available" v-model="amount">
		<output>{{amount}} / {{available}}</output>

		<button type="submit">consume</button>

	</form>
</template>

<style scoped>

</style>