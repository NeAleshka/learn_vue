<template>
  <div
    class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
    :class="{
      'border-4': selectTickerId === ticker.id,
    }"
  >
    <div class="px-4 py-5 sm:p-6 text-center">
      <dt class="text-sm font-medium text-gray-500 truncate">
        {{ ticker.name }}
      </dt>
      <dd class="mt-1 text-3xl font-semibold text-gray-900">
        {{ formatPrice(ticker.price) }}
      </dd>
    </div>
    <div class="w-full border-t border-gray-200"></div>
    <button @click.stop="deleteTicker(ticker.id)" class="ticker_button">
      <img src="../assets/images/Basket.svg" alt="Delete" class="h-5 w-5" />
      Удалить
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { ITicker } from "../../interfaces";

export default defineComponent({
  name: "AppTicker",
  props: {
    ticker: {
      type: Object as PropType<ITicker>,
      required: true,
      default: {},
    },
    selectTickerId: {
      type: String,
      required: false,
      default: "",
    },
  },
  emits: {
    "delete-ticker"(tickerId: string) {
      return typeof tickerId === "string";
    },
    click: null,
  },
  methods: {
    deleteTicker(tickerId: string) {
      this.$emit("delete-ticker", tickerId);
    },
    formatPrice(price: number | string) {
      if (typeof price === "number") {
        return price < 1 ? price.toPrecision(2) : price.toFixed(2);
      }
      return "-";
    },
  },
});
</script>
