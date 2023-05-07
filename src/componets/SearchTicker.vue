<template>
  <div class="flex items-center space-x-2">
    <span>Поиск :</span>
    <input v-model="filter" class="input max-w-[200px]" />
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      filter: "",
    };
  },
  emits: {
    "change-filter"(filter: string) {
      return typeof filter === "string";
    },
  },
  watch: {
    filter() {
      this.$emit("change-filter", this.filter);
    },
  },
};
</script>
