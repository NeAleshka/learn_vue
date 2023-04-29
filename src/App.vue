<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <section>
        <label for="wallet" class="block text-sm font-medium text-gray-700"
        >Тикер</label
        >
        <div class="flex">
          <div class="mt-1 rounded-md mb-2 w-full">
            <div class="flex justify-between w-full items-start">
              <div>
                <input
                    type="text"
                    @input="isExistTicker = false"
                    v-model="tickerName"
                    name="wallet"
                    id="wallet"
                    class="mb-2 py-2 pl-1 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                    placeholder="Например DOGE"
                />
                <div
                    v-if="foundedCoins.length && tickerName"
                    class="flex bg-white shadow-md p-1 rounded-md flex-wrap"
                >
                  <span
                      v-for="coin in foundedCoins"
                      @click="addTicker(coin)"
                      class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
                  >
                    {{ coin }}
                  </span>
                </div>
              </div>
              <input
                  v-model="filter"
                  class="input max-w-[200px]"
                  placeholder="Поиск"
                  v-if="tickers.length"
              />
            </div>
          </div>

          <div v-if="isExistTicker" class="text-sm text-red-600">
            Такой тикер уже добавлен
          </div>
        </div>
        <button
            type="button"
            @click="addTicker(tickerName)"
            v-if="tickerName.length"
            class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <img src="src/assets/images/Plus.svg" alt="add" class="-ml-0.5 mr-2 h-6 w-6"/>
          Добавить
        </button>
        <div>
          <button class="navBtn mr-2" @click="page -= 1" v-if="page > 1">
            Назад
          </button>
          <button class="navBtn" @click="page += 1" v-if="hasNextPage">
            Вперёд
          </button>
        </div>
      </section>

      <hr v-if="tickers.length" class="w-full border-t border-gray-600 my-4"/>
      <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div
            v-for="ticker in paginationTickers"
            :class="[
            'ticker',
            {
              'border-4': ticker.id === selectedTicker.id,
            },
          ]"
            @click="selectTicker(ticker)"
        >
          <div class="px-4 py-5 sm:p-6 text-center">
            <dt
                class="text-sm font-medium text-gray-500 truncate"
                v-if="!ticker.haveError"
            >
              {{ ticker.name }} - USD
            </dt>

            <dd
                class="mt-1 font-semibold text-gray-900"
                :style="{ fontSize: ticker.haveError ? '20px' : '1.8rem' }"
            >
              {{ ticker.price }}
            </dd>
          </div>
          <div class="w-full border-t border-gray-200"></div>
          <button
              @click.stop="deleteTicker(ticker)"
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
          >
            <img src="src/assets/images/Basket.svg" alt="del" class="h-5 w-5">
            Удалить
          </button>
        </div>
      </dl>
      <hr v-if="tickers.length" class="w-full border-t border-gray-600 my-4"/>
      <section class="relative" v-if="selectedTicker?.id">
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
          {{selectedTicker.name}} - USD
        </h3>
        <div class="flex items-end border-gray-600 border-b border-l h-64">
          <div
              v-for="(height, index) in normalizeGraph"
              :key="index"
              :style="{ height: `${height}%` }"
              class="bg-blue-800 w-10 border"
          ></div>
        </div>
        <button type="button" class="absolute top-0 right-0" @click="selectTicker({id:''})">
          <img src="src/assets/images/Xmark.svg" alt="close">
        </button>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {uuid} from "vue-uuid";
import {getCoinsList, subscribeToTicker} from "./api";
import type {ITicker, ITickerWSRequest} from "./interfaces";

export default defineComponent({
  name: "App",
  data() {
    return {
      tickerName: "",
      tickers: [] as ITicker[],
      isExistTicker: false,
      coinsList: [] as string[],
      foundedCoins: [] as string[],
      selectedTicker: {} as ITicker,
      page: 1,
      filter: "",
      graph: [] as number[],
    };
  },
  created() {
    const tickersData = localStorage.getItem("crypto");
    if (tickersData?.length) {
      this.tickers = JSON.parse(tickersData);
      this.tickers.forEach((ticker) => {
        subscribeToTicker(ticker?.name||'', (wsRequest: ITickerWSRequest) => {
          this.updateTickers(ticker?.id, wsRequest);
        });
      });
    }
    getCoinsList().then((res) => {
      this.coinsList = res.sort((a, b) => {
        return a.length - b.length;
      });
    });
  },
  computed: {
    filteredTickers() {
      return this.tickers.filter((ticker) =>
          ticker.name?.toUpperCase().includes(this.filter.toUpperCase())
      );
    },

    startIndex() {
      return (this.page - 1) * 6;
    },

    endIndex() {
      return this.page * 6;
    },

    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },

    paginationTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
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
    updateTickers(tickerId: string|undefined, wsRequest: ITickerWSRequest) {
      const updateTickerIndex = this.tickers.findIndex(
          (ticker) => ticker.id === tickerId
      );

      if (wsRequest.type === "5" && updateTickerIndex !== -1) {
        const prevPrice = this.tickers[updateTickerIndex].price;
        this.tickers[updateTickerIndex].price = wsRequest.newPrice
            ? wsRequest.newPrice
            : prevPrice;
        this.tickers[updateTickerIndex].haveError=false
        if (this.selectedTicker?.id === tickerId && wsRequest.newPrice) {
          this.graph.push(wsRequest.newPrice);
        }
      }


      if (wsRequest.type === "500") {
        const nane = this.tickers[updateTickerIndex].name;
        this.tickers[updateTickerIndex].price = `${nane} not calculating now`;
        this.tickers[updateTickerIndex].haveError = true;
      }
    },

    addTicker(tickerName: string) {
      const newTicker: ITicker = {
        id: uuid.v4(),
        name: tickerName,
        price: "-",
      };
      subscribeToTicker(newTicker.name||'', (wsRequest: ITickerWSRequest) => {
        this.updateTickers(newTicker.id, wsRequest);
      });

      this.tickers = [newTicker, ...this.tickers];
      localStorage.setItem("crypto", JSON.stringify([...this.tickers]));
    },

    selectTicker(ticker: ITicker) {
      this.selectedTicker = ticker;
    },

    deleteTicker(tickerToRemove: ITicker) {
      this.tickers = this.tickers.filter(
          (ticker) => ticker.id !== tickerToRemove.id
      );
      localStorage.setItem("crypto", JSON.stringify(this.tickers));
    },
  },
  watch: {
    tickerName() {
      const foundedCoins = this.coinsList.filter((coin) =>
          coin.includes(this.tickerName.toUpperCase())
      );
      if (foundedCoins.length) {
        this.foundedCoins = foundedCoins.slice(0, 4);
      }
    },

    paginationTickers() {
      if (this.page > 1 && !this.paginationTickers.length) {
        this.page -= 1;
      }
    },
    selectedTicker() {
      this.graph = [];
    },
  },
});
</script>
