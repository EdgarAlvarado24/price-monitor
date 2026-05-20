import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors } from "../theme/colors";
import { useRates } from "../hooks/useRates";
import { RateCard } from "../components/RateCard";
import { SpreadCard } from "../components/SpreadCard";
import { MarketStatus } from "../components/MarketStatus";
import { Header } from "../components/Header";
import { SkeletonCard } from "../components/SkeletonCard";

export function HomeScreen() {
  const { rates, loading, isUsingCache, error, refresh } = useRates();

  if (loading || !rates) {
    return (
      <View style={styles.container}>
        <Header title="Tasas del día" subtitle="Cargando..." loading />
        <ScrollView contentContainerStyle={styles.content}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </ScrollView>
      </View>
    );
  }

  const usdChange = rates.current.usd - rates.previous.usd;
  const eurChange = rates.current.eur - rates.previous.eur;
  const usdtChange = rates.current.usdt - rates.previous.usdt;

  // Determinar si el mercado está abierto (simplificado: entre 8am y 5pm semana LAB)
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  const isOpen = day >= 1 && day <= 5 && hour >= 8 && hour < 17;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("es-VE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const lastUpdate = formatDate(rates.current.date);

  return (
    <View style={styles.container}>
      <Header
        title="Tasas del día"
        subtitle={lastUpdate}
        loading={loading}
        onRefresh={refresh}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Dólar BCV */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <RateCard
            currency="DÓLAR BCV"
            code="USD"
            icon="attach-money"
            value={rates.current.usd}
            change={usdChange}
            changePercent={rates.changePercentage.usd}
            color={colors.usdColor}
          />
        </Animated.View>

        {/* Euro BCV */}
        <Animated.View entering={FadeInDown.duration(400).delay(80)}>
          <RateCard
            currency="EURO BCV"
            code="EUR"
            icon="euro"
            value={rates.current.eur}
            change={eurChange}
            changePercent={rates.changePercentage.eur}
            color={colors.eurColor}
          />
        </Animated.View>

        {/* USDT Binance P2P */}
        <Animated.View entering={FadeInDown.duration(400).delay(160)}>
          <RateCard
            currency="USDT (P2P)"
            code="USDT"
            icon="currency-bitcoin"
            value={rates.current.usdt}
            change={usdtChange}
            changePercent={rates.changePercentage.usdt}
            color={colors.usdtColor}
          />
        </Animated.View>

        {/* Spread BCV vs USDT */}
        <Animated.View entering={FadeInDown.duration(400).delay(240)}>
          <SpreadCard
            bcvPrice={rates.current.usd}
            usdtPrice={rates.current.usdt}
          />
        </Animated.View>

        {/* Estado del mercado */}
        <Animated.View entering={FadeInDown.duration(400).delay(320)}>
          <MarketStatus
            open={isOpen}
            lastUpdate={lastUpdate}
            isUsingCache={isUsingCache}
            error={error}
          />
        </Animated.View>
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 16,
  },
});

export default HomeScreen;
