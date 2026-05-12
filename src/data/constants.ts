import { ConversionOption } from "../types/rates";

export const CACHE_KEY = "@rates_cache";

export const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 min

export const conversionOptions: ConversionOption[] = [
  { key: "usd-to-bs", label: "USD → Bs", from: "USD", to: "Bs", rateKey: "usd", icon: "attach-money" },
  { key: "bs-to-usd", label: "Bs → USD", from: "Bs", to: "USD", rateKey: "usd", icon: "attach-money" },
  { key: "eur-to-bs", label: "EUR → Bs", from: "EUR", to: "Bs", rateKey: "eur", icon: "euro" },
  { key: "bs-to-eur", label: "Bs → EUR", from: "Bs", to: "EUR", rateKey: "eur", icon: "euro" },
  { key: "usdt-to-bs", label: "USDT → Bs", from: "USDT", to: "Bs", rateKey: "usdt", icon: "currency-bitcoin" },
  { key: "bs-to-usdt", label: "Bs → USDT", from: "Bs", to: "USDT", rateKey: "usdt", icon: "currency-bitcoin" },
  { key: "cop-to-bs", label: "COP → Bs", from: "COP", to: "Bs", rateKey: "cop", icon: "currency-exchange" },
  { key: "bs-to-cop", label: "Bs → COP", from: "Bs", to: "COP", rateKey: "cop", icon: "currency-exchange" },
  { key: "brl-to-bs", label: "BRL → Bs", from: "BRL", to: "Bs", rateKey: "brl", icon: "currency-exchange" },
  { key: "bs-to-brl", label: "Bs → BRL", from: "Bs", to: "BRL", rateKey: "brl", icon: "currency-exchange" },
];

export const currencyConfig: Record<string, { symbol: string; name: string; color: string; flag: string }> = {
  USD: { symbol: "$", name: "Dólar BCV", color: "#00D4AA", flag: "🇺🇸" },
  EUR: { symbol: "€", name: "Euro BCV", color: "#5C6BC0", flag: "🇪🇺" },
  USDT: { symbol: "₮", name: "USDT (Binance P2P)", color: "#26A69A", flag: "💎" },
  COP: { symbol: "$", name: "Peso Colombiano", color: "#F44336", flag: "🇨🇴" },
  BRL: { symbol: "R$", name: "Real Brasileño", color: "#43A047", flag: "🇧🇷" },
  Bs: { symbol: "Bs.", name: "Bolívar", color: "#00D4AA", flag: "🇻🇪" },
};

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
