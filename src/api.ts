import axios from "axios";

const instance = axios.create({
  baseURL: "https://min-api.cryptocompare.com/data/",
});

const tickersHandlers = new Map();

const API_KEY =
  "c2fdab0bddf7507d8d824785213988f466e800388a91b08ae83e37ebd88e43d4";

const webSocket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

export const loadTicker = (tickersName: string[]) => {
  return instance
    .get(`pricemulti?fsyms=${tickersName.join(",")}&tsyms=USD`)
    .then((res) => {
      return Object.fromEntries(
        Object.entries(res.data).map(([key, value]) => [
          key,
          //@ts-ignore
          value.USD,
        ])
      );
    });
};

const AGGRIGATE_INDEX = "5";
const ERROR_INDEX = "500";
let currentTickerForWS = "";
const sendToWS = (tickerName: string, action: string) => {
  const message = JSON.stringify({
    action,
    subs: [`5~CCCAGG~${tickerName}~USD`],
  });
  if (webSocket.readyState === webSocket.OPEN) {
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

webSocket.addEventListener("message", (event) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
    INFO: info,
  } = JSON.parse(event.data);
  if (type === AGGRIGATE_INDEX) {
    const handlers = tickersHandlers.get(currency) || [];
    handlers.forEach((fn: Function) => fn({ newPrice, type }));
  }

  if (type === ERROR_INDEX) {
    const handlers = tickersHandlers.get(currentTickerForWS) || [];
    handlers.forEach((fn: Function) => fn({ type, info }));
  }
});

export const getCoinsList = async () => {
  let coinList: string[] = [];
  await instance.get("all/coinlist?summary=true").then((res) => {
    coinList = Object.keys(res.data.Data);
  });
  return coinList;
};

export const subscribeToTicker = (ticketName: string, cb: Function) => {
  currentTickerForWS = ticketName;
  const subscribers = tickersHandlers.get(ticketName) || [];
  tickersHandlers.set(ticketName, [...subscribers, cb]);
  sendToWS(ticketName, "SubAdd");
};

export  const unsubscribeToTicker = (tickerName:string) => {
  tickersHandlers.delete(tickerName)
  sendToWS(tickerName,'SubRemove')
}