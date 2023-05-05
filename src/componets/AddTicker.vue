<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тикер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            @keydown.enter="add(ticker)"
            type="text"
            name="wallet"
            id="wallet"
            class="input"
            placeholder="Например DOGE"
          />
        </div>
        <div
          v-if="foundedTickers.length && ticker.length"
          class="flex bg-white shadow-md p-1 rounded-md flex-wrap w-fit"
        >
          <span
            v-for="t in foundedTickers"
            @click="add(t)"
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            {{ t }}
          </span>
        </div>
        <div v-if="isExistTicker" class="text-sm text-red-600">
          Такой тикер уже добавлен
        </div>
        <div v-if="incorrectCoin" class="text-sm text-red-600">
          Такой тикер не существует
        </div>
      </div>
    </div>
    <add-button @click="add" />
  </section>
</template>

<script lang="ts">
import { ITicker } from "../../interfaces";
import { tickerApi } from "../api";
import AddButton from "./AddButton.vue";
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    tickers: {
      type: Array<ITicker>,
      required: true,
      defaul: "",
    },
  },

  components: {
    AddButton,
  },
  data() {
    return {
      ticker: "",
      coinList: [],
      incorrectCoin: false,
      isExistTicker: false,
      foundedTickers: [] as string[],
    };
  },
  created() {
    tickerApi.getCoinsList().then((res) => {
      this.coinList = res.Data;
    });
  },
  methods: {
    add(tickerName: string) {
      if (!this.ticker.length) {
        return;
      }

      if (!Object.keys(this.coinList).find((t) => t === tickerName)) {
        this.incorrectCoin = true;
        return;
      }
      if (this.tickers.find((t) => t.name === tickerName)) {
        this.isExistTicker = true;
        return;
      }
      this.isExistTicker = false;
      this.$emit("add-ticker", tickerName);
      this.ticker = "";
    },
  },
  watch: {
    ticker() {
      this.isExistTicker = false;
      this.incorrectCoin = false;
      this.foundedTickers = Object.keys(this.coinList);
      this.foundedTickers = this.foundedTickers
        .filter((t) => t.includes(this.ticker))
        .slice(0, 4);
    },
  },
});
</script>
