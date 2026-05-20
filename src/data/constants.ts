import { ConversionOption } from "../types/rates";

// Incrementar este número cada vez que cambies la estructura de datos
// para invalidar la caché de usuarios existentes
const CACHE_VERSION = 2;

export const CACHE_KEY = `@rates_cache_v${CACHE_VERSION}`;

export const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 min

export const conversionOptions: ConversionOption[] = [
  { key: "dolar_bcv", label: "Dólar BCV", simbolo: "$", rateKey: "usd", icon: "attach-money" },
  { key: "euro_bcv", label: "Euro BCV", simbolo: "€", rateKey: "eur", icon: "euro" },
  { key: "usdt", label: "USDT", simbolo: "₮", rateKey: "usdt", icon: "currency-bitcoin" },
];

export function formatNumber(n: number, decimals = 2): string {
  return n.toLocaleString("es-VE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatChange(change: number): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}`;
}

export function formatPercent(pct: number): string {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}
