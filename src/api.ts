import axios from "axios";

const instance = axios.create({
  baseURL: "https://min-api.cryptocompare.com/data/",
});

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

export const getCoinsList = async () => {
  let coinList: string[] = [];
  await instance.get("all/coinlist?summary=true").then((res) => {
    coinList = Object.keys(res.data.Data);
  });
  return coinList;
};
