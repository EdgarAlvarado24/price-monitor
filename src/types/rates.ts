export interface RatesData {
  current: {
    usd: number;
    eur: number;
    usdt?: number;
    date: string;
  };
  previous: {
    usd: number;
    eur: number;
    usdt?: number;
    date: string;
  };
  changePercentage: {
    usd: number;
    eur: number;
    usdt?: number;
  };
}