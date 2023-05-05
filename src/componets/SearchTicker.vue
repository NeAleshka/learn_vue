<template>
  <div class="flex items-center space-x-2">
    <p>Поиск :</p>
    <input v-model="filter" />
  </div>
</template>
<script lang="ts">
export default {
  data() {
    return {
      filter: "",
    };
  },
  watch: {
    filter() {
      this.$emit("change-filter", this.filter);
    },
  },
};
</script>
