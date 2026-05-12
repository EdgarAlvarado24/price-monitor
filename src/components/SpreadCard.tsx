import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { formatNumber, formatChange, formatPercent } from "../data/constants";

type Props = {
  bcvPrice: number;
  usdtPrice: number;
};

export function SpreadCard({ bcvPrice, usdtPrice }: Props) {
  const diff = usdtPrice - bcvPrice;
  const percentage = (diff / bcvPrice) * 100;
  const isPositive = diff >= 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MaterialIcons name="compare-arrows" size={16} color={colors.primary} />
        <Text style={styles.title}>BCV vs USDT</Text>
      </View>

      <View style={styles.bars}>
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>BCV</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: "60%", backgroundColor: colors.primary }]} />
          </View>
          <Text style={styles.barValue}>Bs. {formatNumber(bcvPrice)}</Text>
        </View>
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>USDT</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: "78%", backgroundColor: colors.usdtColor }]} />
          </View>
          <Text style={styles.barValue}>Bs. {formatNumber(usdtPrice)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.diffRow}>
        <Text style={styles.diffLabel}>Diferencia</Text>
        <Text style={[styles.diffValue, { color: isPositive ? colors.green : colors.red }]}>
          {formatChange(diff)} ({formatPercent(percentage)})
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  title: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  bars: {
    gap: 8,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  barLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    width: 36,
  },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceLight,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
  barValue: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
    width: 90,
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  diffRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  diffLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  diffValue: {
    fontSize: 13,
    fontWeight: "700",
  },
});

export default SpreadCard;
