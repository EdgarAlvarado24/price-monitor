import { useEffect, useState } from "react";
import { getRates } from "../services/rates.service";
import { RatesData } from "../types/rates";

export function useRates() {
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState<RatesData | null>(null);

  useEffect(() => {
    getRates()
      .then(setRates)
      .finally(() => setLoading(false));
  }, []);

  return { rates, loading };
}
