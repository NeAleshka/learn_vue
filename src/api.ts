import axios from "axios";
import { IConvertCurrencies } from "../interfaces";

const API_KEY =
  "c2fdab0bddf7507d8d824785213988f466e800388a91b08ae83e37ebd88e43d4";

const instance = axios.create({
  baseURL: "https://min-api.cryptocompare.com/data/",
});

const tickersHandler = new Map();
const webSocket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGREGATE_INDEX = "5";
let is500Handling = false;
let currentCurrynce = "";

const sendToWebSocket = (
  ticker: string,
  action: string,
  toCurrency?: string
) => {
  const message = {
    action: action,
    subs: [`5~CCCAGG~${ticker}~${toCurrency || "USD"}`],
  };
  if (webSocket.readyState === WebSocket.OPEN) {
    webSocket.send(JSON.stringify(message));
    return;
  }
  webSocket.addEventListener(
    "open",
    () => {
      webSocket.send(JSON.stringify(message));
    },
    { once: true }
  );
};

export const bc = new BroadcastChannel(document.title);
let сonvertСurrencies: IConvertCurrencies[] = [];

webSocket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
    PARAMETER: parametr,
  } = JSON.parse(e.data);
  if (type === AGREGATE_INDEX) {
    const handlers = tickersHandler.get(currency) || [];
    handlers.forEach((fn: Function) => {
      fn(newPrice, type);
      bc.postMessage({ currency, newPrice });
    });
  }
  if (type === "500" && !is500Handling) {
    sendToWebSocket(currentCurrynce, "SubAdd", "BTC");
    сonvertСurrencies.push({
      name: currentCurrynce,
      priceToBTC: newPrice,
    });
    if (сonvertСurrencies.length === 1) {
      sendToWebSocket("BTC", "SubAdd");
    }
    is500Handling = true;
  }
  if (сonvertСurrencies.find((c) => c.name === currency)) {
    const foundedCur = сonvertСurrencies.findIndex(
      (cur) => cur.name === currency
    );
    if (foundedCur !== -1) {
      сonvertСurrencies[foundedCur].priceToBTC = newPrice;
    }
  }

  if (currency === "BTC") {
    сonvertСurrencies.forEach((c) => {
      const handlers = tickersHandler.get(c.name) || [];
      handlers.forEach((fn: Function) => {
        fn(c.priceToBTC ? c.priceToBTC * newPrice : 0);
        bc.postMessage({
          currency: c.name,
          newPrice: c.priceToBTC ? c.priceToBTC * newPrice : 0,
        });
      });
    });
  }
  if (parametr === `5~CCCAGG~${currentCurrynce}~BTC`) {
    const handlers = tickersHandler.get(currentCurrynce) || [];
    handlers.forEach((fn: Function) => fn(500));
    is500Handling = false;
  }
});

export const tickerApi = {
  getCoinsList() {
    return instance.get("all/coinlist?summary=true").then((res) => res.data);
  },

  subscribeToTicker(ticker: string, cb: Function) {
    currentCurrynce = ticker;
    const subscribers = tickersHandler.get(ticker) || [];
    tickersHandler.set(ticker, [...subscribers, cb]);
    sendToWebSocket(ticker, "SubAdd");
  },

  unsubscribeFromTicker(ticker: string) {
    tickersHandler.delete(ticker);
    sendToWebSocket(ticker, "SubRemove");
    сonvertСurrencies = сonvertСurrencies.filter((c) => c.name !== ticker);
  },
};
