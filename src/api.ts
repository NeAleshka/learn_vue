import axios from "axios";

/* const api = {
  loadTicker: async (tickersName: string[]) => {
    const data = await fetch(
      `https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${tickersName.join(
        ","
      )}`
    );
    return await data.json();
  },
  getCoinsList: async () => {
    const data = await fetch(
      "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
    );
    const res = await data.json();
    return res.Data;
  },
};

export default api; */

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
