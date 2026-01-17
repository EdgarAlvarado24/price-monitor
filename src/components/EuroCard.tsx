import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";

type Props = {
  value: number;
};

export function EuroCard({ value }: Props) {
  return (
    <LinearGradient
      colors={[colors.card, "rgba(30,30,35,0.3)"]}
      style={styles.card}
    >
      <Text style={styles.label}>EURO</Text>

      <View style={styles.priceRow}>
        <Text style={styles.currency}>Bs.</Text>
        <Text style={styles.price}>{value.toFixed(2)}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "85%",
    marginTop: -24,
    padding: 24,
    borderRadius: 32,
    alignItems: "center",
  },
  label: {
    color: colors.textMuted,
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: "700",
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  currency: {
    color: colors.textMuted,
    fontSize: 18,
    marginRight: 4,
  },
  price: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
  },
});
