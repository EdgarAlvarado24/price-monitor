import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { RatesData } from "../types/rates";

const PREV_RATES_KEY = "@prev_rates";
const CROSS_RATES_KEY = "@cross_rates";
const CROSS_RATES_TTL = 4 * 60 * 60 * 1000; // 4 horas
const RATES_HISTORY_KEY = "@rates_history";

// ─── Helpers ───────────────────────────────────────────────

function parseVENumber(raw: string): number {
  const cleaned = raw.trim().replace(/\./g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

function calcChangePct(current: number, prev: number): number {
  return prev > 0 ? ((current - prev) / prev) * 100 : 0;
}

// ─── Cross-rates con cache ─────────────────────────────────

interface CrossRatesCache {
  cop: number;
  brl: number;
  timestamp: number;
}

async function getCachedCrossRates(): Promise<CrossRatesCache | null> {
  try {
    const raw = await AsyncStorage.getItem(CROSS_RATES_KEY);
    if (!raw) return null;
    const data: CrossRatesCache = JSON.parse(raw);
    if (Date.now() - data.timestamp > CROSS_RATES_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

async function saveCrossRates(cop: number, brl: number): Promise<void> {
  try {
    await AsyncStorage.setItem(
      CROSS_RATES_KEY,
      JSON.stringify({ cop, brl, timestamp: Date.now() })
    );
  } catch {
    /* ignore */
  }
}

async function fetchCrossRates(): Promise<{ cop: number; brl: number }> {
  // Intentar caché primero
  const cached = await getCachedCrossRates();
  if (cached) return { cop: cached.cop, brl: cached.brl };

  try {
    const res = await fetch(
      "https://api.frankfurter.app/latest?from=USD&to=COP,BRL"
    );
    const data = await res.json();
    const cop = data.rates.COP;
    const brl = data.rates.BRL;
    await saveCrossRates(cop, brl);
    return { cop, brl };
  } catch {
    // Fallback: caché aunque esté vencido
    try {
      const raw = await AsyncStorage.getItem(CROSS_RATES_KEY);
      if (raw) {
        const data: CrossRatesCache = JSON.parse(raw);
        return { cop: data.cop, brl: data.brl };
      }
    } catch {
      /* ignore */
    }
    // Valores aproximados finales
    return { cop: 3735, brl: 4.9 };
  }
}

// ─── Previous rates reales ─────────────────────────────────

interface PrevRates {
  usd: number;
  eur: number;
  usdt: number;
  cop: number;
  brl: number;
  date: string;
}

async function loadPrevRates(): Promise<PrevRates | null> {
  try {
    const raw = await AsyncStorage.getItem(PREV_RATES_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function savePrevRates(r: PrevRates): Promise<void> {
  try {
    await AsyncStorage.setItem(PREV_RATES_KEY, JSON.stringify(r));
  } catch {
    /* ignore */
  }
}

// ─── Histórico de snapshots para Analytics ─────────────────

export interface RateSnapshot {
  timestamp: string;
  usd: number;
  eur: number;
  usdt: number;
}

async function appendHistory(
  snapshot: RateSnapshot
): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(RATES_HISTORY_KEY);
    const history: RateSnapshot[] = raw ? JSON.parse(raw) : [];
    // Evitar duplicados: no guardar si el último snapshot tiene el mismo precio
    const last = history[history.length - 1];
    if (
      last &&
      last.usd === snapshot.usd &&
      last.eur === snapshot.eur &&
      last.usdt === snapshot.usdt
    ) {
      return;
    }
    history.push(snapshot);
    // Mantener máx. 300 puntos (~25 horas a intervalos de 5 min)
    if (history.length > 300) {
      history.splice(0, history.length - 300);
    }
    await AsyncStorage.setItem(RATES_HISTORY_KEY, JSON.stringify(history));
  } catch {
    /* ignore */
  }
}

export async function getRatesHistory(
  limit = 100
): Promise<RateSnapshot[]> {
  try {
    const raw = await AsyncStorage.getItem(RATES_HISTORY_KEY);
    if (!raw) return [];
    const history: RateSnapshot[] = JSON.parse(raw);
    return history.slice(-limit);
  } catch {
    return [];
  }
}

// ─── USDT desde Binance P2P (Android / iOS) ────────────────

const BINANCE_P2P_URL =
  "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";

interface BinanceP2PAd {
  price: number;
  qty: number;
}

async function fetchUsdtFromBinanceP2P(): Promise<number> {
  const response = await fetch(BINANCE_P2P_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      asset: "USDT",
      fiat: "VES",
      tradeType: "SELL",
      page: 1,
      rows: 10,
      payTypes: [],
      publisherType: null,
    }),
  });

  if (!response.ok) {
    throw new Error(`Binance P2P responded with ${response.status}`);
  }

  const data = await response.json();

  if (!data.data || data.data.length === 0) {
    throw new Error("Binance P2P returned no data");
  }

  const ads: BinanceP2PAd[] = data.data.map((adv: any) => ({
    price: parseFloat(adv.adv.price),
    qty: parseFloat(adv.adv.tradableQuantity),
  }));

  ads.sort((a, b) => a.price - b.price);

  const top = ads.slice(0, Math.min(5, ads.length));
  const avg = top.reduce((sum, ad) => sum + ad.price, 0) / top.length;

  return avg;
}

// ─── USDT / USD paralelo desde Yadio (WEB) ─────────────────
// Yadio soporta CORS, necesario para que funcione en navegadores

async function fetchUsdtFromYadio(): Promise<number> {
  const response = await fetch("https://api.yadio.io/rate/usd/VES");

  if (!response.ok) {
    throw new Error(`Yadio responded with ${response.status}`);
  }

  const data = await response.json();

  if (!data.rate || data.rate <= 0) {
    throw new Error("Yadio returned invalid rate");
  }

  // Yadio devuelve la tasa inversa: rate = 1 / USD_VES
  // Ej: rate 0.0014 → 1 USDT ≈ 1 / 0.0014 ≈ 714 Bs
  const usdtVes = 1 / data.rate;

  return usdtVes;
}

// ─── Función principal ─────────────────────────────────────

export async function getRates(): Promise<RatesData> {
  // En web: usamos Yadio (CORS-friendly). En native: Binance P2P.
  const fetchUsdt = Platform.OS === "web"
    ? fetchUsdtFromYadio
    : fetchUsdtFromBinanceP2P;

  const [vesResponse, usdtPrice] = await Promise.all([
    fetch(
      "https://raw.githubusercontent.com/thehermit3007/Quadra_API/main/data.json"
    ),
    fetchUsdt().catch(() => null), // Si falla, usamos el fallback de Quadra
  ]);

  if (!vesResponse.ok) {
    throw new Error(`Quadra API responded with ${vesResponse.status}`);
  }

  const vesData = await vesResponse.json();

  if (vesData.status !== "success") {
    throw new Error("Quadra API returned error status");
  }

  const usdVes = parseVENumber(vesData.rates.USD);
  const eurVes = parseVENumber(vesData.rates.EUR);
  const usdtVes = usdtPrice ?? parseVENumber(vesData.rates.USDT);
  const timestamp = vesData.timestamp || new Date().toISOString();
  const isLive = vesData.cache_info?.bcv_source === "live";

  // Cross-rates (con caché de 4h)
  const cross = await fetchCrossRates();
  const copVes = usdVes / cross.cop;
  const brlVes = usdVes / cross.brl;

  // Cargar tasas anteriores reales
  const prev = await loadPrevRates();

  const previous = prev
    ? prev
    : {
        usd: usdVes,
        eur: eurVes,
        usdt: usdtVes,
        cop: copVes,
        brl: brlVes,
        date: timestamp,
      };

  // Guardar las actuales como "anteriores" para la próxima vez
  await savePrevRates({
    usd: usdVes,
    eur: eurVes,
    usdt: usdtVes,
    cop: copVes,
    brl: brlVes,
    date: timestamp,
  });

  // Guardar snapshot histórico
  await appendHistory({
    timestamp,
    usd: usdVes,
    eur: eurVes,
    usdt: usdtVes,
  });

  return {
    current: {
      usd: usdVes,
      eur: eurVes,
      usdt: usdtVes,
      cop: copVes,
      brl: brlVes,
      date: timestamp,
    },
    previous: { ...previous },
    changePercentage: {
      usd: calcChangePct(usdVes, previous.usd),
      eur: calcChangePct(eurVes, previous.eur),
      usdt: calcChangePct(usdtVes, previous.usdt),
      cop: calcChangePct(copVes, previous.cop),
      brl: calcChangePct(brlVes, previous.brl),
    },
    metadata: {
      source: usdtPrice
        ? `Quadra_API + ${Platform.OS === "web" ? "Yadio" : "Binance P2P"}`
        : "Quadra_API",
      lastUpdate: timestamp,
      isLive,
    },
  };
}
