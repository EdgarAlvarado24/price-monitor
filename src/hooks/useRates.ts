import { useEffect, useState, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getRates, getRatesHistory, RateSnapshot } from "../services/rates.service";
import { RatesData } from "../types/rates";
import { CACHE_KEY, REFRESH_INTERVAL_MS } from "../data/constants";

interface UseRatesReturn {
  rates: RatesData | null;
  loading: boolean;
  isUsingCache: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  history: RateSnapshot[];
}

export function useRates(): UseRatesReturn {
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState<RatesData | null>(null);
  const [isUsingCache, setIsUsingCache] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<RateSnapshot[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

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
      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ rates: data, cachedAt: Date.now() })
      );
    } catch (e) {
      console.error("Error caching rates:", e);
    }
  }, []);

  const fetchRates = useCallback(async () => {
    try {
      setError(null);
      const freshRates = await getRates();
      if (!mountedRef.current) return;

      setRates(freshRates);
      setIsUsingCache(false);
      setLoading(false);

      // Cargar histórico actualizado
      getRatesHistory(100).then((h) => {
        if (mountedRef.current) setHistory(h);
      });

      await saveToCache(freshRates);
    } catch (err) {
      if (!mountedRef.current) return;
      console.log("Error fetching rates:", err);
      // Si ya tenemos datos (cargados de caché), solo marcamos el error
      if (rates) {
        setError("No se pudieron actualizar las tasas. Mostrando datos almacenados.");
        setIsUsingCache(true);
      } else {
        setError("No se pudieron obtener las tasas. Verifica tu conexión.");
      }
      setLoading(false);
    }
  }, [saveToCache, rates]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchRates();
  }, [fetchRates]);

  useEffect(() => {
    mountedRef.current = true;

    // 1. Mostrar datos cacheados inmediatamente
    (async () => {
      const cached = await loadCachedRates();
      if (cached && !rates && mountedRef.current) {
        setRates(cached);
        setIsUsingCache(true);
        setLoading(false);
      }
    })();

    // 2. Cargar histórico
    getRatesHistory(100).then((h) => {
      if (mountedRef.current) setHistory(h);
    });

    // 3. Fetch fresco
    fetchRates();

    // 4. Auto-refresh periódico
    intervalRef.current = setInterval(fetchRates, REFRESH_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { rates, loading, isUsingCache, error, refresh, history };
}
