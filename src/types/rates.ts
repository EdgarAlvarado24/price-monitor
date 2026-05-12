export interface RateDetail {
  price: number;
  priceRaw: string;
  change: number;
  changePercentage: number;
}

export interface RatesData {
  current: {
    usd: number;
    eur: number;
    usdt: number;
    cop: number;   // 1 COP en Bs (tasa cruzada)
    brl: number;   // 1 BRL en Bs (tasa cruzada)
    date: string;
  };
  previous: {
    usd: number;
    eur: number;
    usdt: number;
    cop: number;
    brl: number;
    date: string;
  };
  changePercentage: {
    usd: number;
    eur: number;
    usdt: number;
    cop: number;
    brl: number;
  };
  metadata: {
    source: string;
    lastUpdate: string;
    isLive: boolean;
  };
}

export interface RateCardData {
  currency: string;
  code: string;
  icon: string;
  value: number;
  change: number;
  changePercent: number;
  color: string;
}

export type ConversionType =
  | "usd-to-bs"
  | "bs-to-usd"
  | "eur-to-bs"
  | "bs-to-eur"
  | "usdt-to-bs"
  | "bs-to-usdt"
  | "cop-to-bs"
  | "bs-to-cop"
  | "brl-to-bs"
  | "bs-to-brl";

export interface ConversionOption {
  key: ConversionType;
  label: string;
  from: string;
  to: string;
  rateKey: keyof RatesData["current"];
  icon: string;
}
