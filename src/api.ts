import axios from "axios";

const API_KEY =
  "9d3082b720e1d067eaf9e6642f527260a444faafe38b6c3aa6a2c9573954082e";

const instance = axios.create({
  baseURL: "https://min-api.cryptocompare.com/data/",
});

const tickersHandler = new Map();

const AGREGATE_INDEX = "5";

const sendToWebSocket = (ticker: string,action:string) => {
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
