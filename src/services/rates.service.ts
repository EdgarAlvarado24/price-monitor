import { RatesData } from "../types/rates";

/**
 * Parsea un número en formato venezolano (ej: " 500,46060000 ") a float
 */
function parseVENumber(raw: string): number {
  const cleaned = raw.trim().replace(/\./g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

/**
 * Calcula tasas cruzadas: 1 COP en Bs, 1 BRL en Bs
 * usando la tasa USD de la Quadra API y cross-rates internacionales
 */
async function fetchCrossRates(): Promise<{ cop: number; brl: number; date: string }> {
  const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=COP,BRL");
  const data = await res.json();
  // data.rates.COP = cuántos COP por 1 USD
  // data.rates.BRL = cuántos BRL por 1 USD
  // 1 COP en Bs = (1 USD en Bs) / (1 USD en COP)
  // 1 BRL en Bs = (1 USD en Bs) / (1 USD en BRL)
  return {
    cop: data.rates.COP,
    brl: data.rates.BRL,
    date: data.date,
  };
}

const CROSS_RATE_CACHE_KEY = "@cross_rates_cache";
const CROSS_RATE_TTL = 4 * 60 * 60 * 1000; // 4 horas

async function getCrossRates(date: string): Promise<{ cop: number; brl: number }> {
  try {
    const cross = await fetchCrossRates();
    return { cop: cross.cop, brl: cross.brl };
  } catch {
    // Fallback a valores aproximados si falla la API
    return { cop: 3735, brl: 4.9 };
  }
}

export async function getRates(): Promise<RatesData> {
  const [vesResponse] = await Promise.all([
    fetch("https://raw.githubusercontent.com/thehermit3007/Quadra_API/main/data.json"),
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
  const usdtVes = parseVENumber(vesData.rates.USDT);
  const timestamp = vesData.timestamp || new Date().toISOString();
  const isLive = vesData.cache_info?.bcv_source === "live";

  // Obtener tasas cruzadas COP y BRL
  const cross = await getCrossRates(timestamp);
  const copVes = usdVes / cross.cop;
  const brlVes = usdVes / cross.brl;

  // Simulamos "previous" con una variación del 0.5% para demo
  // En producción se obtendría de un endpoint histórico
  const usdPrev = usdVes * (1 - 0.005);
  const eurPrev = eurVes * (1 - 0.003);
  const usdtPrev = usdtVes * (1 - 0.008);
  const copPrev = copVes * (1 - 0.005);
  const brlPrev = brlVes * (1 - 0.004);

  return {
    current: {
      usd: usdVes,
      eur: eurVes,
      usdt: usdtVes,
      cop: copVes,
      brl: brlVes,
      date: timestamp,
    },
    previous: {
      usd: usdPrev,
      eur: eurPrev,
      usdt: usdtPrev,
      cop: copPrev,
      brl: brlPrev,
      date: timestamp,
    },
    changePercentage: {
      usd: ((usdVes - usdPrev) / usdPrev) * 100,
      eur: ((eurVes - eurPrev) / eurPrev) * 100,
      usdt: ((usdtVes - usdtPrev) / usdtPrev) * 100,
      cop: ((copVes - copPrev) / copPrev) * 100,
      brl: ((brlVes - brlPrev) / brlPrev) * 100,
    },
    metadata: {
      source: "Quadra_API",
      lastUpdate: timestamp,
      isLive,
    },
  };
}
