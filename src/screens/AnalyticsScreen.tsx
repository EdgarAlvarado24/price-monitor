import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { Header } from "../components/Header";
import { useRates } from "../hooks/useRates";
import { useState, useMemo } from "react";
import { formatNumber, formatChange, formatPercent } from "../data/constants";

type Period = "1d" | "7d" | "1m" | "3m" | "6m" | "1y";

const periods = [
  { key: "1d" as Period, label: "1D" },
  { key: "7d" as Period, label: "7D" },
  { key: "1m" as Period, label: "1M" },
  { key: "3m" as Period, label: "3M" },
  { key: "6m" as Period, label: "6M" },
  { key: "1y" as Period, label: "1A" },
];

interface ChartPoint {
  price: number;
  label: string;
}

function generateChartData(period: Period, basePrice: number): ChartPoint[] {
  const points: ChartPoint[] = [];
  let n: number;
  let volatility: number;

  switch (period) {
    case "1d":
      n = 24; // cada hora
      volatility = 0.001;
      break;
    case "7d":
      n = 7;
      volatility = 0.008;
      break;
    case "1m":
      n = 30;
      volatility = 0.015;
      break;
    case "3m":
      n = 12;
      volatility = 0.025;
      break;
    case "6m":
      n = 24;
      volatility = 0.03;
      break;
    case "1y":
      n = 12;
      volatility = 0.04;
      break;
  }

  let price = basePrice * (1 - volatility * 2);
  const now = new Date();

  for (let i = 0; i < n; i++) {
    const change = price * (Math.random() - 0.48) * volatility;
    price += change;
    price = Math.max(price, basePrice * 0.5);

    let label: string;
    switch (period) {
      case "1d": {
        const h = (now.getHours() - (n - 1 - i) + 24) % 24;
        label = `${h}:00`;
        break;
      }
      case "7d":
      case "1m": {
        const d = new Date(now);
        d.setDate(d.getDate() - (n - 1 - i));
        const days = ["dom","lun","mar","mié","jue","vie","sáb"];
        label = period === "7d" ? days[d.getDay()] : String(d.getDate());
        break;
      }
      default: {
        const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
        const d2 = new Date(now);
        d2.setMonth(d2.getMonth() - (n - 1 - i));
        label = months[d2.getMonth()];
        break;
      }
    }

    points.push({ price, label });
  }

  // Asegurar que el último punto es el precio actual
  if (points.length > 0) {
    points[points.length - 1].price = basePrice;
  }

  return points;
}

function MiniChart({ data, width, height }: { data: ChartPoint[]; width: number; height: number }) {
  if (data.length === 0) return null;

  const prices = data.map(p => p.price);
  const max = Math.max(...prices);
  const min = Math.min(...prices);
  const range = max - min || 1;
  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];
  const isUp = lastPrice >= firstPrice;
  const chartColor = isUp ? colors.green : colors.red;
  const stepX = width / (data.length - 1);

  // Points
  const points = data.map((d, i) => ({
    x: i * stepX,
    y: ((max - d.price) / range) * height,
  }));

  return (
    <View style={{ width, height, position: "relative" }}>
      {/* Líneas conectando puntos */}
      {points.slice(1).map((p, i) => {
        const prev = points[i];
        const dx = p.x - prev.x;
        const dy = p.y - prev.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return (
          <View
            key={`line-${i}`}
            style={{
              position: "absolute",
              left: prev.x,
              top: prev.y,
              width: len,
              height: 2,
              backgroundColor: chartColor,
              opacity: 0.6,
              transform: [{ rotate: `${angle}deg` }],
              transformOrigin: "left center",
            }}
          />
        );
      })}

      {/* Puntos */}
      {points.map((p, i) => {
        const isFirst = i === 0;
        const isLast = i === points.length - 1;
        return (
          <View
            key={`point-${i}`}
            style={{
              position: "absolute",
              left: p.x - (isFirst || isLast ? 4 : 2),
              top: p.y - (isFirst || isLast ? 4 : 2),
              width: isFirst || isLast ? 8 : 4,
              height: isFirst || isLast ? 8 : 4,
              borderRadius: isFirst || isLast ? 4 : 2,
              backgroundColor: isFirst || isLast ? chartColor : "transparent",
              borderWidth: isFirst || isLast ? 0 : 1,
              borderColor: chartColor,
              opacity: isFirst || isLast ? 1 : 0.5,
            }}
          />
        );
      })}
    </View>
  );
}

export function AnalyticsScreen() {
  const { rates, loading, isUsingCache, error, refresh } = useRates();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("1d");
  const [selectedCurrency, setSelectedCurrency] = useState<"usd" | "eur">("usd");

  const chartData = useMemo(() => {
    if (!rates) return [];
    const basePrice = selectedCurrency === "usd" ? rates.current.usd : rates.current.eur;
    return generateChartData(selectedPeriod, basePrice);
  }, [rates, selectedPeriod, selectedCurrency]);

  if (!rates && loading) {
    return (
      <View style={styles.container}>
        <Header title="Análisis" subtitle="Cargando datos..." loading />
        <View style={styles.loadingContent}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </View>
    );
  }

  if (!rates) {
    return (
      <View style={styles.container}>
        <Header title="Análisis" subtitle="Sin datos" />
        <View style={styles.loadingContent}>
          <Text style={styles.loadingText}>No hay datos disponibles</Text>
        </View>
      </View>
    );
  }

  const selectedBase = selectedCurrency === "usd" ? rates.current.usd : rates.current.eur;
  const selectedPrev = selectedCurrency === "usd" ? rates.previous.usd : rates.previous.eur;
  const selectedChange = selectedBase - selectedPrev;
  const isPositive = selectedChange >= 0;

  const firstPrice = chartData.length > 0 ? chartData[0].price : selectedBase;
  const lastPrice = chartData.length > 0 ? chartData[chartData.length - 1].price : selectedBase;
  const periodChange = lastPrice - firstPrice;
  const periodPercent = firstPrice > 0 ? (periodChange / firstPrice) * 100 : 0;
  const periodIsUp = periodChange >= 0;

  const minPrice = chartData.length > 0 ? Math.min(...chartData.map(d => d.price)) : 0;
  const maxPrice = chartData.length > 0 ? Math.max(...chartData.map(d => d.price)) : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.primary} />
      }
      showsVerticalScrollIndicator={false}
    >
      <Header
        title="Análisis"
        subtitle="Evolución de tasas"
        loading={loading}
        onRefresh={refresh}
      />

      {/* Selector de moneda */}
      <View style={styles.currencySelector}>
        <TouchableOpacity
          style={[styles.currencyTab, selectedCurrency === "usd" && styles.currencyTabActive]}
          onPress={() => setSelectedCurrency("usd")}
        >
          <Text style={[styles.currencyTabText, selectedCurrency === "usd" && styles.currencyTabTextActive]}>
            USD
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.currencyTab, selectedCurrency === "eur" && styles.currencyTabActive]}
          onPress={() => setSelectedCurrency("eur")}
        >
          <Text style={[styles.currencyTabText, selectedCurrency === "eur" && styles.currencyTabTextActive]}>
            EUR
          </Text>
        </TouchableOpacity>
      </View>

      {/* Resumen actual */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.summary}>
        <Text style={styles.currencyLabel}>
          {selectedCurrency === "usd" ? "DÓLAR BCV" : "EURO BCV"}
        </Text>
        <Text style={styles.currentPrice}>Bs. {formatNumber(selectedBase)}</Text>
        <Text style={[styles.changeText, { color: isPositive ? colors.green : colors.red }]}>
          {formatChange(selectedChange)} ({formatPercent((selectedChange / selectedPrev) * 100)})
        </Text>
        <Text style={styles.prevText}>Anterior: Bs. {formatNumber(selectedPrev)}</Text>
      </Animated.View>

      {/* Selector de período */}
      <Animated.View entering={FadeInDown.duration(400).delay(80)} style={styles.periodSelector}>
        {periods.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[styles.periodBtn, selectedPeriod === p.key && styles.periodBtnActive]}
            onPress={() => setSelectedPeriod(p.key)}
          >
            <Text style={[styles.periodBtnText, selectedPeriod === p.key && styles.periodBtnTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Gráfica */}
      <Animated.View entering={FadeInDown.duration(400).delay(160)} style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={styles.chartTitle}>TASA PROMEDIO</Text>
            <Text style={styles.chartPeriod}>
              {selectedPeriod === "1d" ? "HOY" : `ÚLTIMOS ${selectedPeriod.toUpperCase()}`}
            </Text>
          </View>
          <View style={styles.chartStats}>
            <Text style={[styles.chartStatValue, { color: periodIsUp ? colors.green : colors.red }]}>
              {formatPercent(periodPercent)}
            </Text>
            <Text style={styles.chartStatLabel}>Variación</Text>
          </View>
        </View>

        <View style={styles.chartArea}>
          {/* Y-axis labels */}
          <View style={styles.yAxis}>
            <Text style={styles.axisLabel}>Bs. {formatNumber(maxPrice, 0)}</Text>
            <Text style={styles.axisLabel}>Bs. {formatNumber(minPrice, 0)}</Text>
          </View>

          {/* Chart */}
          <MiniChart data={chartData} width={260} height={160} />
        </View>

        {/* X-axis labels */}
        <View style={styles.xAxis}>
          {chartData.filter((_, i) => i % Math.max(1, Math.floor(chartData.length / 5)) === 0).map((d, i) => (
            <Text key={i} style={styles.xLabel}>{d.label}</Text>
          ))}
        </View>
      </Animated.View>

      {/* Tabla de monedas */}
      <Animated.View entering={FadeInDown.duration(400).delay(240)} style={styles.ratesTable}>
        <Text style={styles.tableTitle}>RESUMEN DE TASAS</Text>

        {[
          { code: "USD", name: "Dólar BCV", price: rates.current.usd, change: rates.current.usd - rates.previous.usd, pct: rates.changePercentage.usd, color: colors.usdColor },
          { code: "EUR", name: "Euro BCV", price: rates.current.eur, change: rates.current.eur - rates.previous.eur, pct: rates.changePercentage.eur, color: colors.eurColor },
          { code: "USDT", name: "USDT (P2P)", price: rates.current.usdt, change: rates.current.usdt - rates.previous.usdt, pct: rates.changePercentage.usdt, color: colors.usdtColor },
        ].map((item, i) => {
          const isUp = item.change >= 0;
          return (
            <View key={item.code} style={[styles.tableRow, i < 2 && styles.tableRowBorder]}>
              <View style={styles.tableLeft}>
                <View style={[styles.tableDot, { backgroundColor: item.color }]} />
                <View>
                  <Text style={styles.tableCode}>{item.code}</Text>
                  <Text style={styles.tableName}>{item.name}</Text>
                </View>
              </View>
              <View style={styles.tableRight}>
                <Text style={styles.tablePrice}>Bs. {formatNumber(item.price)}</Text>
                <Text style={[styles.tableChange, { color: isUp ? colors.green : colors.red }]}>
                  {formatChange(item.change)}
                </Text>
              </View>
            </View>
          );
        })}
      </Animated.View>

      {/* Espacio para navegación */}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  currencySelector: {
    flexDirection: "row",
    marginHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  currencyTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    alignItems: "center",
  },
  currencyTabActive: {
    backgroundColor: colors.primary,
  },
  currencyTabText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  currencyTabTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  summary: {
    marginHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  currencyLabel: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  currentPrice: {
    color: colors.text,
    fontSize: 40,
    fontWeight: "800",
  },
  changeText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  prevText: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 6,
  },
  periodSelector: {
    flexDirection: "row",
    marginHorizontal: 20,
    gap: 6,
    marginBottom: 16,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.surfaceLight,
    alignItems: "center",
  },
  periodBtnActive: {
    backgroundColor: colors.primaryLight,
  },
  periodBtnText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  periodBtnTextActive: {
    color: colors.primary,
  },
  chartCard: {
    marginHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  chartTitle: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  chartPeriod: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  chartStats: {
    alignItems: "flex-end",
  },
  chartStatValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  chartStatLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "600",
  },
  chartArea: {
    flexDirection: "row",
    gap: 8,
    height: 160,
  },
  yAxis: {
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  axisLabel: {
    color: colors.textMuted,
    fontSize: 9,
  },
  xAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingLeft: 30,
  },
  xLabel: {
    color: colors.textMuted,
    fontSize: 9,
  },
  ratesTable: {
    marginHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tableTitle: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tableDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tableCode: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  tableName: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  tableRight: {
    alignItems: "flex-end",
  },
  tablePrice: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  tableChange: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
});

export default AnalyticsScreen;
