export interface RatesData {
  current: {
    usd: number;
    eur: number;
    date: string;
  };
  previous: {
    usd: number;
    eur: number;
    date: string;
  };
  changePercentage: {
    usd: number;
    eur: number;
  };
}