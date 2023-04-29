export interface ITicker {
  name: string;
  price: number | string;
  id: string;
  haveError?: boolean;
}

export interface ITickerWSRequets {
  type: string;
  newPrice?: number;
  info: string;
}
