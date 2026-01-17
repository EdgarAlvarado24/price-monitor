import { useEffect, useState } from "react";
import { getRates } from "../services/rates.service";

export function useRates() {
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState<any>(null);

  useEffect(() => {
    getRates()
      .then(setRates)
      .finally(() => setLoading(false));
  }, []);

  return { rates, loading };
}
