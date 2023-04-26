import axios from "axios";

const API_KEY =
  "9d3082b720e1d067eaf9e6642f527260a444faafe38b6c3aa6a2c9573954082e";

const instance = axios.create({
  baseURL: "https://min-api.cryptocompare.com/data/",
});

const tickersHandler = new Map();

export const tickerApi = {
  loadTicker(tickersName: string[]): Promise<any> {
    return instance
      .get(
        `pricemulti?fsyms=${[...tickersHandler.keys()].join(
          ","
        )}&tsyms=USD&api_key=${API_KEY}`
      )
      .then((res) => {
        const updatedData = Object.fromEntries(
          Object.entries(res.data).map(([key, value]) => [
            key,
            //@ts-ignore
            value.USD,
          ])
        );

        return Object.entries(updatedData).forEach(([currency, newPrice]) => {
          const handlers = tickersHandler.get(currency) ?? [];
          handlers.forEach((fn: Function) => fn(newPrice));
        });
      });
  },
  getCoinsList() {
    return instance.get("all/coinlist?summary=true").then((res) => res.data);
  },

  subscribeToTicker(ticker: any, cb: Function) {
    const subscribers = tickersHandler.get(ticker) || [];
    tickersHandler.set(ticker, [...subscribers, cb]);
  },

  unsubscribeFromTicker(ticker: string) {
    tickersHandler.delete(ticker);
  },
};
// window.tickers = tickers;
