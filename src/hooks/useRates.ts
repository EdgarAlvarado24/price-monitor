import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getRates } from "../services/rates.service";
import { RatesData } from "../types/rates";

const CACHE_KEY = '@rates_cache';

export function useRates() {
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState<RatesData | null>(null);
  const [isUsingCache, setIsUsingCache] = useState(false);

  const loadCachedRates = async (): Promise<RatesData | null> => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const { rates } = JSON.parse(cached);
        return rates;
      }
    } catch (error) {
      console.error('Error loading cached rates:', error);
    }
    return null;
  };

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const freshRates = await getRates();
        setRates(freshRates);
        setIsUsingCache(false);
        
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ rates: freshRates }));
      } catch (error) {
        console.log('Error fetching rates, trying cache:', error);
        const cachedRates = await loadCachedRates();
        if (cachedRates) {
          setRates(cachedRates);
          setIsUsingCache(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  return { rates, loading, isUsingCache };
}
