import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

type Props = {
  value: number;
  change: number;
};

export function PriceCard({ value, change }: Props) {
  return (
    <LinearGradient
      colors={[colors.card, "rgba(30,30,35,0.3)"]}
      style={styles.card}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeText}>DÓLAR</Text>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.currency}>Bs.</Text>
        <Text style={styles.price}>{value}</Text>
      </View>

      <View style={styles.trend}>
        <MaterialIcons name="trending-up" size={18} color={colors.green} />
        <Text style={styles.trendText}>+{change}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    padding: 40,
    borderRadius: 40,
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(79,209,197,0.1)",
  },
  badgeText: {
    color: colors.primary,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "700",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  currency: {
    color: colors.textMuted,
    fontSize: 24,
  },
  price: {
    color: "#fff",
    fontSize: 64,
    fontWeight: "800",
  },
  trend: {
    flexDirection: "row",
    marginTop: 12,
  },
  trendText: {
    color: colors.green,
    marginLeft: 4,
    fontWeight: "700",
  },
});

export default PriceCard;