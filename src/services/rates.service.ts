import axios from "axios";

export async function getRates() {
  // EJEMPLO – reemplazar por BCV o API real
  const response = await axios.get("https://api.dolarvzla.com/public/exchange-rate");
  return response.data.current.usd;
}
