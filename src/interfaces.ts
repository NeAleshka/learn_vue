export interface ITicker {
  name?: string;
  price?: number | string;
  id?: string;
  haveError?: boolean;
}

export interface ITickerWSRequest {
  type: string;
  newPrice?: number;
  info: string;
}
