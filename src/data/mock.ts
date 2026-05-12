import { RatesData } from "../types/rates";

export const mockRates: RatesData = {
  current: {
    usd: 500.46,
    eur: 589.27,
    usdt: 658.33,
    cop: 0.134,
    brl: 102.14,
    date: "2026-05-12T02:04:08Z",
  },
  previous: {
    usd: 497.96,
    eur: 587.51,
    usdt: 653.07,
    cop: 0.133,
    brl: 101.66,
    date: "2026-05-12T02:04:08Z",
  },
  changePercentage: {
    usd: 0.50,
    eur: 0.30,
    usdt: 0.81,
    cop: 0.50,
    brl: 0.47,
  },
  metadata: {
    source: "mock",
    lastUpdate: "2026-05-12T02:04:08Z",
    isLive: false,
  },
};
