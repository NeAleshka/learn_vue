import axios from "axios";

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

const sendToWebSocket = (ticker: string, action: string) => {
  const message = JSON.stringify({
    action: action,
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
  if (webSocket.readyState === WebSocket.OPEN) {
    webSocket.send(message);
    return;
  }
  webSocket.addEventListener(
    "open",
    () => {
      webSocket.send(message);
    },
    { once: true }
  );
};

webSocket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
  } = JSON.parse(e.data);
  if (type !== AGREGATE_INDEX) return;
  const handlers = tickersHandler.get(currency) || [];
  handlers.forEach((fn: Function) => fn(newPrice));
});

export const tickerApi = {
  getCoinsList() {
    return instance.get("all/coinlist?summary=true").then((res) => res.data);
  },

  subscribeToTicker(ticker: string, cb: Function) {
    const subscribers = tickersHandler.get(ticker) || [];
    tickersHandler.set(ticker, [...subscribers, cb]);
    sendToWebSocket(ticker, "SubAdd");
  },

  unsubscribeFromTicker(ticker: string) {
    tickersHandler.delete(ticker);
    sendToWebSocket(ticker, "SubRemove");
  },
};
