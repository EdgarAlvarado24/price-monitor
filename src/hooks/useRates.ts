import { useEffect, useState, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getRates } from "../services/rates.service";
import { RatesData } from "../types/rates";
import { CACHE_KEY, REFRESH_INTERVAL_MS } from "../data/constants";

interface UseRatesReturn {
  rates: RatesData | null;
  loading: boolean;
  isUsingCache: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useRates(): UseRatesReturn {
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState<RatesData | null>(null);
  const [isUsingCache, setIsUsingCache] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadCachedRates = useCallback(async (): Promise<RatesData | null> => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const { rates: cachedRates } = JSON.parse(cached);
        return cachedRates as RatesData;
      }
    } catch (e) {
      console.error("Error loading cached rates:", e);
    }
    return null;
  }, []);

  const saveToCache = useCallback(async (data: RatesData) => {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ rates: data, cachedAt: Date.now() }));
    } catch (e) {
      console.error("Error caching rates:", e);
    }
  }, []);

  const fetchRates = useCallback(async () => {
    try {
      setError(null);
      const freshRates = await getRates();
      setRates(freshRates);
      setIsUsingCache(false);
      setLoading(false);
      await saveToCache(freshRates);
    } catch (err) {
      console.log("Error fetching rates, using cache:", err);
      const cached = await loadCachedRates();
      if (cached) {
        setRates(cached);
        setIsUsingCache(true);
        setLoading(false);
        setError(null);
      } else {
        setError("No se pudieron obtener las tasas. Verifica tu conexión.");
        setLoading(false);
      }
    }
  }, [loadCachedRates, saveToCache]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchRates();
  }, [fetchRates]);

  useEffect(() => {
    fetchRates();

    // Auto-refresh periódico
    intervalRef.current = setInterval(fetchRates, REFRESH_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchRates]);

  return { rates, loading, isUsingCache, error, refresh };
}
