import { View, StyleSheet } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { PriceCard } from "../components/PriceCard";
import { EuroCard } from "../components/EuroCard";
import { MarketStatus } from "../components/MarketStatus";
import { BottomNav } from "../components/BottomNav";
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
          <Animated.View entering={FadeInUp.delay(150)}>
            <EuroCard value={0} />
          </Animated.View>
          <MarketStatus open={false} lastUpdate="Cargando..." />
        </View>
        <BottomNav />
      </View>
    );
  }

  const usdChange = rates.current.usd - rates.previous.usd;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View entering={FadeInUp.duration(500)}>
          <PriceCard value={rates.current.usd} change={usdChange} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(150)}>
          <EuroCard value={rates.current.eur} />
        </Animated.View>

        <MarketStatus open lastUpdate={`Actualizado: ${rates.current.date}`} />
      </View>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
});
