<template>
  <div class="mx-auto w-fit text-2xl text-red-600" v-if="showIf">
    {{ msg }}
  </div>
</template>

<script lang="ts">
export default {
  name: "AppError",
  props: {
    showIf: {
      type: Boolean,
    },
    msg: {
      type: String,
    },
  },
};
// v-if="!filteredTickers.length && filter.length"
</script>
