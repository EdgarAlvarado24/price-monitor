import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

type Props = {
  bcvPrice: number;
  usdtPrice: number;
};

export function USDTDiffCard({ bcvPrice, usdtPrice }: Props) {
  const diff = usdtPrice - bcvPrice;
  const percentage = (diff / bcvPrice) * 100;
  const isPositive = diff >= 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MaterialIcons name="compare-arrows" size={20} color={colors.primary} />
        <Text style={styles.title}>DIFERENCIA BCV vs USDT</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.priceRow}>
          <Text style={styles.label}>BCV (USD):</Text>
          <Text style={styles.value}>Bs. {bcvPrice.toFixed(2)}</Text>
        </View>
        
        <View style={styles.priceRow}>
          <Text style={styles.label}>USDT:</Text>
          <Text style={styles.value}>Bs. {usdtPrice.toFixed(2)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.diffRow}>
          <Text style={styles.diffLabel}>Diferencia:</Text>
          <Text style={[styles.diffValue, { color: isPositive ? colors.green : colors.red }]}>
            {isPositive ? "+" : ""}Bs. {diff.toFixed(2)}
          </Text>
        </View>

        <View style={styles.percentRow}>
          <Text style={styles.percentLabel}>Porcentaje:</Text>
          <Text style={[styles.percentValue, { color: isPositive ? colors.green : colors.red }]}>
            {isPositive ? "+" : ""}{percentage.toFixed(2)}%
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    padding: 20,
    borderRadius: 24,
    backgroundColor: colors.card,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    color: colors.primary,
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: "700",
    marginLeft: 8,
  },
  content: {
    gap: 8,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: colors.textMuted,
    fontSize: 14,
  },
  value: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 8,
  },
  diffRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  diffLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  diffValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  percentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  percentLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  percentValue: {
    fontSize: 16,
    fontWeight: "700",
  },
});

export default USDTDiffCard;
