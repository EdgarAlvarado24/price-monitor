import axios from "axios";
import { RatesData } from "../types/rates";

const API_KEY = "3b418f8e467b6393fd476961bae76353f4dbc7b49781e243baa7656abeb124d5";

export async function getRates(): Promise<RatesData> {
  const [exchangeResponse, usdtResponse] = await Promise.all([
    axios.get("https://api.dolarvzla.com/public/exchange-rate", {
      headers: { "x-dolarvzla-key": API_KEY }
    }),
    axios.get("https://api.dolarvzla.com/public/usdt/exchange-rate", {
      headers: { "x-dolarvzla-key": API_KEY }
    })
  ]);

  return {
    current: {
      usd: exchangeResponse.data.current.usd,
      eur: exchangeResponse.data.current.eur,
      usdt: usdtResponse.data.current.average,
      date: exchangeResponse.data.current.date
    },
    previous: {
      usd: exchangeResponse.data.previous.usd,
      eur: exchangeResponse.data.previous.eur,
      usdt: usdtResponse.data.previous.average,
      date: exchangeResponse.data.previous.date
    },
    changePercentage: {
      usd: exchangeResponse.data.changePercentage.usd,
      eur: exchangeResponse.data.changePercentage.eur,
      usdt: usdtResponse.data.changePercentage.average
    }
  };
}
