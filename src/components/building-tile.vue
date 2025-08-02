<script setup lang="ts">

import { Building } from "../building.store";

const {building} = defineProps<{
	building: Building
}>()
</script>

<template>
<div class="building tile">
	{{building.type.icon}} {{building.type.name}}
</div>
</template>

<style scoped>

</style>