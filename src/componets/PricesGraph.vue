<template>
  <section v-if="selectedTicker.id" class="relative">
    <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
      {{ selectedTicker.name }} - USD
    </h3>
    <div
      class="flex items-end border-gray-600 border-b border-l h-64"
      ref="graph"
    >
      <div
        v-for="(bar, i) in normalizedGraph"
        :key="i"
        :style="{ height: `${bar}%` }"
        class="bg-purple-800 border w-10"
      ></div>
    </div>
    <div></div>
    <button
      type="button"
      class="absolute top-0 right-0"
      @click="selectedTicker.id = ''"
    >
      <img src="../assets/images/Close.svg" alt="close" />
    </button>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { ITicker } from "../../interfaces";

export default defineComponent({
  name: "pricesGraph",
  props: {
    graph: {
      type: Array<number>,
      requared: false,
      default: [],
    },
    selectedTicker: {
      type: Object as PropType<ITicker>,
      required: false,
      default: {},
    },
  },
  computed: {
    normalizedGraph(): number[] {
      const maxValue = Math.max(...this.graph);
      const minValue = Math.min(...this.graph);
      if (maxValue === minValue) {
        return this.graph.map(() => 50);
      }
      return this.graph.map(
        (price) => 5 + ((price - minValue) * 95) / (maxValue - minValue)
      );
    },
  },
  updated() {
    if (this.$props.graph.length > this.maxColoumnGraph) {
      this.$props.graph.shift();
    }
    this.calculatedMaxColoumnGraph();
  },
  mounted() {
    window.addEventListener("resize", this.calculatedMaxColoumnGraph);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.calculatedMaxColoumnGraph);
  },
  data() {
    return {
      maxColoumnGraph: 1,
    };
  },
  methods: {
    calculatedMaxColoumnGraph() {
      if (this.$refs.graph) {
        //@ts-ignore
        this.maxColoumnGraph = this.$refs.graph.clientWidth / 38;
      } else return;
    },
  },
});
</script>
