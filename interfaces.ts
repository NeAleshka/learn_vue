export interface ITicker {
  name: string;
  price: number | string;
  id: string;
}

export interface IBroadCastEvent{
  currency:string,
  newPrice:string
}