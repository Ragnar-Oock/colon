<script setup lang="ts">

import { getResourceIcon, useResourceStore } from "../stores/resource.store";

const {resources} = useResourceStore();
</script>

<template>
<div class="resources">
	<div class="resource" v-for="(amount, type) in resources" :key="type"><span :title="type">{{getResourceIcon(type)}}</span> {{amount}}</div>
</div>
</template>

<style scoped>
.resources {
	display: flex;
}

</style>