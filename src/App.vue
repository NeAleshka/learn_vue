<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <app-dialog :withButton="true" :textButton="''" />
      <add-ticker :tickers="tickers" @add-ticker="add" />
      <search-ticker @change-filter="changeFilter" />
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
        <app-ticker
          v-for="t in paginatedTickers"
          :ticker="t"
          :selectTickerId="selectedTicker.id"
          @delete-ticker="deleteTicker"
          @click="select(t)"
        />
      </dl>
      <hr v-if="tickers.length" class="w-full border-t border-gray-600 my-4" />
      <prices-graph :graph="graph" :selectedTicker="selectedTicker" />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { ITicker, IBroadCastEvent } from "../interfaces";
import { tickerApi, bc } from "./api";
import AddTicker from "./componets/AddTicker.vue";
import SearchTicker from "./componets/SearchTicker.vue";
import AppTicker from "./componets/Ticker.vue";
import PricesGraph from "./componets/PricesGraph.vue";
import AppDialog from "./componets/Dialog.vue";
import AddButton from "./componets/AddButton.vue";

export default defineComponent({
  name: "App",
  components: {
    AddTicker,
    SearchTicker,
    AppTicker,
    PricesGraph,
    AppDialog,
    AddButton,
  },
  data() {
    return {
      tickers: [] as ITicker[],
      selectedTicker: {} as ITicker,
      graph: [] as number[],
      filter: "",
      page: 1,
      isOpenModal: false,
    };
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

    filteredTickers() {
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
  },
  methods: {
    openDialog() {
      this.isOpenModal = true;
    },

    changeFilter(newFilter: string) {
      console.log(newFilter);
      this.filter = newFilter;
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
        }
      }
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
