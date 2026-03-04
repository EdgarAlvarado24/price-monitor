import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

type Props = {
  value: number;
  change: number;
};

export function USDTCard({ value, change }: Props) {
  const isPositive = change >= 0;

  return (
    <LinearGradient
      colors={[colors.card, "rgba(30,30,35,0.3)"]}
      style={styles.card}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeText}>USDT</Text>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.currency}>Bs.</Text>
        <Text style={styles.price}>{value}</Text>
      </View>

      <View style={styles.trend}>
        <MaterialIcons 
          name={isPositive ? "trending-up" : "trending-down"} 
          size={18} 
          color={isPositive ? colors.green : colors.red} 
        />
        <Text style={[styles.trendText, { color: isPositive ? colors.green : colors.red }]}>
          {isPositive ? "+" : ""}{change.toFixed(2)}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    padding: 24,
    borderRadius: 32,
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -10,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(79,209,197,0.1)",
  },
  badgeText: {
    color: colors.primary,
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: "700",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  currency: {
    color: colors.textMuted,
    fontSize: 18,
  },
  price: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
  },
  trend: {
    flexDirection: "row",
    marginTop: 8,
  },
  trendText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "700",
  },
});

export default USDTCard;
