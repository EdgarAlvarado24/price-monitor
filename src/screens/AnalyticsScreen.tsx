import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { colors } from "../theme/colors";
import { useRates } from "../hooks/useRates";
import { useState } from "react";

type Period = "1d" | "7d" | "1m" | "3m" | "6m" | "1y";

const periods = [
  { key: "1d", label: "1 Día" },
  { key: "7d", label: "7 Días" },
  { key: "1m", label: "1 Mes" },
  { key: "3m", label: "3 Meses" },
  { key: "6m", label: "6 Meses" },
  { key: "1y", label: "1 Año" },
];

export function AnalyticsScreen() {
  const { rates, loading } = useRates();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("1d");

  // Generar datos simulados para la gráfica
  const generateChartData = (period: Period) => {
    if (!rates) return { prices: [], labels: [] };

    let prices: number[] = [];
    let labels: string[] = [];

    switch (period) {
      case "1d":
        // Usar datos reales de la API: current y previous
        prices = [rates.previous.usd, rates.current.usd];
        labels = ['Ayer', 'Hoy'];
        break;
      case "7d":
        prices = [rates.previous.usd];
        labels = ['Ayer'];
        for (let i = 1; i < 7; i++) {
          const variation = (Math.random() - 0.5) * 0.1; // ±10% diario
          const price = prices[prices.length - 1] * (1 + variation);
          prices.push(price);
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          labels.push(date.toLocaleDateString('es', { weekday: 'short' }));
        }
        break;
      case "1m":
        prices = [rates.previous.usd];
        labels = ['Inicio'];
        for (let i = 1; i < 30; i++) {
          const variation = (Math.random() - 0.5) * 0.02; // ±2% diario
          const price = prices[prices.length - 1] * (1 + variation);
          prices.push(price);
          labels.push((i + 1).toString());
        }
        break;
      case "3m":
        prices = [rates.previous.usd];
        labels = ['3m atrás'];
        for (let i = 1; i < 12; i++) {
          const variation = (Math.random() - 0.5) * 0.05; // ±5% mensual
          const price = prices[prices.length - 1] * (1 + variation);
          prices.push(price);
          const months3 = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
          const currentMonth = new Date().getMonth();
          labels.push(months3[(currentMonth - 11 + i + 12) % 12]);
        }
        break;
      case "6m":
        prices = [rates.previous.usd];
        labels = ['6m atrás'];
        for (let i = 1; i < 24; i++) {
          const variation = (Math.random() - 0.5) * 0.03; // ±3% mensual
          const price = prices[prices.length - 1] * (1 + variation);
          prices.push(price);
          const months6 = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
          const currentMonth6 = new Date().getMonth();
          const monthIndex = (currentMonth6 - 23 + i + 24) % 12;
          labels.push(months6[monthIndex]);
        }
        break;
      case "1y":
        prices = [rates.previous.usd];
        labels = ['1a atrás'];
        for (let i = 1; i < 12; i++) {
          const variation = (Math.random() - 0.5) * 0.04; // ±4% mensual
          const price = prices[prices.length - 1] * (1 + variation);
          prices.push(price);
          const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
          const currentMonthY = new Date().getMonth();
          labels.push(months[(currentMonthY - 11 + i + 12) % 12]);
        }
        break;
    }

    return { prices, labels };
  };

  const { prices: chartData, labels: chartLabels } = generateChartData(selectedPeriod);
  const maxPrice = Math.max(...chartData);
  const minPrice = Math.min(...chartData);
  const priceRange = maxPrice - minPrice || 1;
  const isPositive = rates ? rates.current.usd > rates.previous.usd : true;

  if (loading || !rates) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Cargando...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Animated.View entering={FadeInUp.duration(500)}>
          <Text style={styles.title}>ANÁLISIS</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(150)} style={styles.currentValue}>
          <Text style={styles.currentLabel}>DÓLAR ACTUAL</Text>
          <Text style={styles.currentPrice}>Bs. {rates.current.usd.toFixed(2)}</Text>
          <Text style={[styles.currentChange, { color: isPositive ? colors.green : colors.red }]}>
            {isPositive ? "+" : ""}
            {(rates.current.usd - rates.previous.usd).toFixed(2)} ({((rates.current.usd - rates.previous.usd) / rates.previous.usd * 100).toFixed(2)}%)
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300)} style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period.key as Period)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period.key && styles.periodButtonTextActive
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(450)} style={styles.chartContainer}>
          <Text style={styles.chartTitle}>EVOLUCIÓN DEL PRECIO</Text>
          <View style={styles.chart}>
            {chartData.map((price, index) => {
              const x = (index / (chartData.length - 1)) * 280;
              const y = ((maxPrice - price) / priceRange) * 180;
              return (
                <View key={`point-${index}`} style={[styles.point, { left: x, top: y }]} />
              );
            })}
            {chartData.slice(1).map((price, index) => {
              const prevPrice = chartData[index];
              const x1 = (index / (chartData.length - 1)) * 280 + 3; // centro del punto
              const y1 = ((maxPrice - prevPrice) / priceRange) * 180 + 3; // centro
              const x2 = ((index + 1) / (chartData.length - 1)) * 280 + 3;
              const y2 = ((maxPrice - price) / priceRange) * 180 + 3;
              const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
              const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
              return (
                <View
                  key={`line-${index}`}
                  style={[
                    styles.line,
                    {
                      left: x1 - distance / 2,
                      top: y1 - 1,
                      width: distance,
                      transform: [{ rotate: `${angle}deg` }]
                    }
                  ]}
                />
              );
            })}
          </View>
          <View style={styles.xAxis}>
            {chartLabels.filter((_, i) => i % Math.ceil(chartLabels.length / 5) === 0).map((label, i) => (
              <Text key={i} style={styles.xLabel}>{label}</Text>
            ))}
          </View>
          <View style={styles.yAxis}>
            <Text style={styles.yLabelHigh}>Bs. {maxPrice.toFixed(0)}</Text>
            <Text style={styles.yLabelLow}>Bs. {minPrice.toFixed(0)}</Text>
          </View>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 100,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 32,
    letterSpacing: 2,
  },
  currentValue: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  currentLabel: {
    color: colors.textMuted,
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: "700",
    marginBottom: 8,
  },
  currentPrice: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "800",
    marginBottom: 8,
  },
  currentChange: {
    fontSize: 16,
    fontWeight: "600",
  },
  periodSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  periodButton: {
    backgroundColor: "rgba(30,30,35,0.5)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    minWidth: "30%",
    alignItems: "center",
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  periodButtonTextActive: {
    color: "#fff",
  },
  chartContainer: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
  },
  chartTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  chart: {
    height: 200,
    marginBottom: 16,
    position: "relative",
  },
  point: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  line: {
    position: "absolute",
    height: 2,
    backgroundColor: colors.primary,
    opacity: 0.7,
  },
  xAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  xLabel: {
    color: colors.textMuted,
    fontSize: 10,
  },
  yAxis: {
    position: "absolute",
    right: 0,
    top: 0,
    height: 200,
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  yLabelHigh: {
    color: colors.textMuted,
    fontSize: 10,
  },
  yLabelLow: {
    color: colors.textMuted,
    fontSize: 10,
  },
});