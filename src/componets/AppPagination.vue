<template>
  <div>
    <button
      class="navBtn mr-2"
      @click="prevPage"
      v-if="page > 1 && tickersLenght"
    >
      Назад
    </button>
    <button class="navBtn" @click="nextPage" v-if="hasNextPage">Вперёд</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    tickersLenght: {
      type: Number,
    },
    hasNextPage: {
      type: Boolean,
    },
    page: {
      type: Number,
      required: true,
    },
  },

  methods: {
    prevPage() {
      this.$emit("prevPage");
    },
    nextPage() {
      this.$emit("nextPage");
    },
  },

  name: "AppPagination",
});
</script>
