import { View, StyleSheet } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { PriceCard } from "../components/PriceCard";
import { EuroCard } from "../components/EuroCard";
import { MarketStatus } from "../components/MarketStatus";
import { BottomNav } from "../components/BottomNav";
import { colors } from "../theme/colors";
import { Axios } from "axios";

export function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View entering={FadeInUp.duration(500)}>
          <PriceCard value={36.45} change={0.12} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(150)}>
          <EuroCard value={39.12} />
        </Animated.View>

        <MarketStatus open lastUpdate="Hoy, 10:32 AM" />
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
