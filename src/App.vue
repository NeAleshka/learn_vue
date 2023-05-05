<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <add-ticker :tickers="tickers" @add-ticker="add" />
      <search-ticker @change-filter="filteredTickers" />
      <button
        class="navBtn mr-2"
        @click="page -= 1"
        v-if="page > 1 && paginatedTickers.length"
      >
        Назад
      </button>
      <button class="navBtn" @click="page += 1" v-if="hasNextPage">
        Вперёд
      </button>

      <hr v-if="tickers.length" class="w-full border-t border-gray-600 my-4" />
      <div
        class="mx-auto w-fit text-2xl text-red-600"
        v-if="!filteredTickers.length && filter.length"
      >
        Совпадений не найдено
      </div>
      <dl
        class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3"
        v-if="paginatedTickers.length"
      >
        <div
          v-for="t in paginatedTickers"
          :key="t.name"
          @click="select(t)"
          :class="{
            'border-4': selectedTicker.id === t.id,
          }"
          class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
        >
          <div class="px-4 py-5 sm:p-6 text-center">
            <dt class="text-sm font-medium text-gray-500 truncate">
              {{ t.name }}
            </dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">
              {{ formatPrice(t.price) }}
            </dd>
          </div>
          <div class="w-full border-t border-gray-200"></div>
          <button @click.stop="deleteTicker(t.id)" class="ticker_button">
            <img
              src="./assets/images/Basket.svg"
              alt="Delete"
              class="h-5 w-5"
            />
            Удалить
          </button>
        </div>
      </dl>
      <hr v-if="tickers.length" class="w-full border-t border-gray-600 my-4" />
      <section v-if="selectedTicker.id" class="relative">
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
          {{ selectedTicker.name }} - USD
        </h3>
        <div
          class="flex items-end border-gray-600 border-b border-l h-64"
          ref="graph"
        >
          <div
            v-for="(bar, i) in normalizeGraph"
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
          <img src="./assets/images/Close.svg" alt="close" />
        </button>
      </section>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { ITicker, IBroadCastEvent } from "../interfaces";
import { tickerApi, bc } from "./api";
import AddTicker from "./componets/AddTicker.vue";
import SearchTicker from "./componets/SearchTicker.vue";

export default defineComponent({
  name: "App",
  components: {
    AddTicker,
    SearchTicker,
  },
  data() {
    return {
      tickers: [] as ITicker[],
      selectedTicker: {} as ITicker,
      graph: [] as number[],
      filter: "",
      page: 1,
      maxColoumnGraph: 1,
    };
  },
  mounted() {
    window.addEventListener("resize", this.calculatedMaxColoumnGraph);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.calculatedMaxColoumnGraph);
  },

  created() {
    let urlParams = new URLSearchParams(window.location.search);
    const urlFilter = urlParams.get("filter");
    const urlPage = urlParams.get("page");
    if (urlFilter) {
      this.filter = urlFilter;
    }

    if (urlPage) {
      this.page = Number(urlPage);
    }

    const tickersData = localStorage.getItem("crypto");
    if (tickersData) {
      bc.addEventListener("message", (e) => {
        console.log(e);

        const event: IBroadCastEvent = e.data;
        JSON.parse(tickersData).forEach((ticker: ITicker) => {
          const tickerForUpdateIndex = this.tickers.findIndex(
            (ticker: ITicker) => ticker.name === event.currency
          );
          if (tickerForUpdateIndex !== -1) {
            const prevPrice = this.tickers[tickerForUpdateIndex].price;
            this.tickers[tickerForUpdateIndex].price = event.newPrice
              ? event.newPrice
              : prevPrice;
          }
        });
      });
      this.tickers = JSON.parse(tickersData);
      this.tickers.forEach((ticker) => {
        tickerApi.subscribeToTicker(ticker.name, (newPrice: number) => {
          this.updateTickerPrice(ticker.id, newPrice);
        });
      });
    }
  },

  computed: {
    pageStateOption() {
      return {
        page: this.page,
        filter: this.filter,
      };
    },

    startIndex() {
      return (this.page - 1) * 6;
    },

    endIndex() {
      return this.page * 6;
    },

    filteredTickers(filter: string) {
      return this.tickers.filter((t) =>
        t.name.toLowerCase().includes(this.filter.toLowerCase())
      );
    },

    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },

    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },

    normalizeGraph() {
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
  methods: {
    calculatedMaxColoumnGraph() {
      if (this.$refs.graph) {
        //@ts-ignore
        this.maxColoumnGraph = this.$refs.graph.clientWidth / 38;
      } else return;
    },

    updateTickerPrice(tickerId: string, price: number) {
      const updateTickerIndex = this.tickers.findIndex(
        (t) => t.id === tickerId
      );
      if (updateTickerIndex !== -1) {
        const prevPrice = this.tickers[updateTickerIndex].price;
        this.tickers[updateTickerIndex].price = price ? price : prevPrice;
        localStorage.setItem("crypto", JSON.stringify(this.tickers));
        if (this.selectedTicker?.id === tickerId && price) {
          this.graph.push(price);
          while (this.graph.length > this.maxColoumnGraph) {
            this.graph.shift();
          }
        }
      }
    },

    formatPrice(price: number | string) {
      if (typeof price === "number") {
        return price < 1 ? price.toPrecision(2) : price.toFixed(2);
      }
      return "-";
    },

    add(tickerName: string) {
      const newTicker: ITicker = {
        name: tickerName.toUpperCase(),
        price: "-",
        id: new Date().toString(),
      };
      this.tickers = [...this.tickers, newTicker];

      tickerApi.subscribeToTicker(newTicker.name, (newPrice: number) => {
        this.updateTickerPrice(newTicker.id, newPrice);
      });
      bc.postMessage(
        JSON.stringify({ tickers: this.tickers, action: "add ticker" })
      );
      bc.addEventListener("message", (e) => {
        this.tickers = e.data;
      });
    },
    select(ticker: ITicker) {
      this.selectedTicker = { ...ticker };
    },
    deleteTicker(id: string) {
      const foundedTickersName = this.tickers.find((t) => t.id === id)?.name;
      if (foundedTickersName) {
        tickerApi.unsubscribeFromTicker(foundedTickersName);
      }
      this.tickers = this.tickers.filter((t) => t.id !== id);
    },
  },
  watch: {
    tickers() {
      localStorage.setItem("crypto", JSON.stringify(this.tickers));
    },
    selectedTicker() {
      this.graph = [];
      this.$nextTick().then(this.calculatedMaxColoumnGraph);
    },
    paginatedTickers() {
      if (!this.paginatedTickers.length && this.page > 1) {
        this.page -= 1;
      }
    },

    filter() {
      this.page = 1;
    },

    pageStateOption(value) {
      window.history.pushState(
        null,
        document.title,
        `?filter=${value.filter}&page=${value.page}`
      );
    },
  },
});
</script>
