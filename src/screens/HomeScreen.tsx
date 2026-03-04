import { View, StyleSheet, ScrollView } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { PriceCard } from "../components/PriceCard";
import { EuroCard } from "../components/EuroCard";
import { USDTCard } from "../components/USDTCard";
import { USDTDiffCard } from "../components/USDTDiffCard";
import { MarketStatus } from "../components/MarketStatus";
import { colors } from "../theme/colors";
import { useRates } from "../hooks/useRates";

export function HomeScreen() {
  const { rates, loading } = useRates();

  if (loading || !rates) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Animated.View entering={FadeInUp.duration(500)}>
            <PriceCard value={0} change={0} />
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(150)} style={styles.overlapCard}>
            <EuroCard value={0} change={0} />
          </Animated.View>
          <MarketStatus open={false} lastUpdate="Cargando..." />
        </View>
      </View>
    );
  }

  const usdChange = rates.current.usd - rates.previous.usd;
  const eurChange = rates.current.eur - rates.previous.eur;
  const usdtChange = rates.current.usdt ? rates.current.usdt - (rates.previous.usdt || rates.current.usdt) : 0;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInUp.duration(500)}>
          <PriceCard value={rates.current.usd} change={usdChange} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(150)} style={styles.overlapCard}>
          <EuroCard value={rates.current.eur} change={eurChange} />
        </Animated.View>

        {rates.current.usdt && (
          <Animated.View entering={FadeInUp.delay(300)} style={styles.overlapCard}>
            <USDTCard value={rates.current.usdt} change={usdtChange} />
          </Animated.View>
        )}

        {rates.current.usdt && (
          <Animated.View entering={FadeInUp.delay(450)}>
            <USDTDiffCard 
              bcvPrice={rates.current.usd} 
              usdtPrice={rates.current.usdt} 
            />
          </Animated.View>
        )}

        <MarketStatus open lastUpdate={`Actualizado: ${rates.current.date}`} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: "center",
    gap: 16,
    paddingVertical: 24,
  },
  overlapCard: {
    marginTop: -24,
  },
});
