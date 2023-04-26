import axios from "axios";

const instance = axios.create({
  baseURL: "https://min-api.cryptocompare.com/data/",
});

export const tickerApi = {
  loadTicker(tickersName: string[]) {
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
  },
  getCoinsList() {
    return instance.get("all/coinlist?summary=true").then((res) => res.data);
  },
};
