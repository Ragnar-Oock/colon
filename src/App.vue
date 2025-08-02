<script setup>
import ResourceTile from "./components/resource-tile.vue";
import AddResourceForm from "./components/add-resource-form.vue";
import {useResourceStore} from "./resource.store.js";
import HarvestResources from "./components/harvest-resources.vue";
import ConsumeResource from "./components/consume-resource.vue";

const resourceStore = useResourceStore();

</script>

<template>
	<add-resource-form/>
	<harvest-resources/>
	<consume-resource/>
  <main>
		<resource-tile
				v-for="resource in resourceStore.resources"
				:key="resource.id"
				:resource
		></resource-tile>
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
