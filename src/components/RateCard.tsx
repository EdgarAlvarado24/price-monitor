import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { RateCardData } from "../types/rates";
import { formatNumber } from "../data/constants";

type Props = RateCardData;

export function RateCard({ currency, code, icon, value, change, changePercent, color }: Props) {
  const isPositive = change >= 0;

  return (
    <LinearGradient
      colors={[colors.elevated, colors.surface]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* Badge superior */}
      <View style={[styles.badge, { backgroundColor: `${color}15` }]}>
        <MaterialIcons name={icon as keyof typeof MaterialIcons.glyphMap} size={10} color={color} />
        <Text style={[styles.badgeText, { color }]}>{currency}</Text>
      </View>

      {/* Precio */}
      <View style={styles.priceRow}>
        <Text style={[styles.currencySign, { color: colors.textMuted }]}>Bs.</Text>
        <Text style={styles.price}>{formatNumber(value)}</Text>
      </View>

      {/* Cambio */}
      <View style={styles.changeRow}>
        <MaterialIcons
          name={isPositive ? "trending-up" : "trending-down"}
          size={14}
          color={isPositive ? colors.green : colors.red}
        />
        <Text style={[styles.changeText, { color: isPositive ? colors.green : colors.red }]}>
          {isPositive ? "+" : ""}{formatNumber(change)} ({isPositive ? "+" : ""}{changePercent.toFixed(2)}%)
        </Text>
      </View>

      {/* Código de moneda */}
      <Text style={styles.code}>{code}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -8,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    marginTop: 4,
  },
  currencySign: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  price: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  changeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  code: {
    position: "absolute",
    top: 16,
    right: 16,
    color: colors.textDim,
    fontSize: 10,
    fontWeight: "500",
  },
});

export default RateCard;
