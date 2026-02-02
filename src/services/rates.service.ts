import axios from "axios";
import { RatesData } from "../types/rates";

export async function getRates(): Promise<RatesData> {
  const response = await axios.get("https://api.dolarvzla.com/public/exchange-rate", {
    headers: {
      "x-dolarvzla-key": "21a2bc0070e3e2df9312fa8199b2ab9f5debf9ade8d8bd9a1119f805e5aff8a2"
    }
  });
  return response.data;
}
