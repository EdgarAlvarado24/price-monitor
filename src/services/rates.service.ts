import axios from "axios";
import { RatesData } from "../types/rates";

export async function getRates(): Promise<RatesData> {
  const response = await axios.get("https://api.dolarvzla.com/public/exchange-rate");
  return response.data;
}
