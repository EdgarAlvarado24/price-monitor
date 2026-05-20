import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { MaterialIcons } from "@expo/vector-icons";

type Props = {
  open: boolean;
  lastUpdate: string;
  isUsingCache?: boolean;
  error?: string | null;
};

export function MarketStatus({ open, lastUpdate, isUsingCache, error }: Props) {
  if (error) {
    return (
      <View style={styles.container}>
        <View style={[styles.badge, { borderColor: "rgba(255,82,82,0.2)" }]}>
          <MaterialIcons name="error-outline" size={12} color={colors.red} />
          <Text style={[styles.badgeText, { color: colors.red }]}>SIN CONEXIÓN</Text>
        </View>
        <View style={styles.update}>
          <Text style={styles.updateValue}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isUsingCache && (
        <View style={styles.cacheBadge}>
          <MaterialIcons name="offline-bolt" size={12} color={colors.primary} />
          <Text style={styles.cacheText}>DATOS CACHEADOS</Text>
        </View>
      )}

      <View style={[styles.badge, { borderColor: open ? "rgba(0,230,118,0.15)" : "rgba(255,82,82,0.15)" }]}>
        <View style={[styles.dot, { backgroundColor: open ? colors.green : colors.red }]} />
        <Text style={[styles.badgeText, { color: open ? colors.green : colors.red }]}>
          {open ? "MERCADO ABIERTO" : "MERCADO CERRADO"}
        </Text>
      </View>

      <View style={styles.update}>
        <Text style={styles.updateLabel}>ACTUALIZADO</Text>
        <Text style={styles.updateValue}>{lastUpdate}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    alignItems: "center",
    gap: 10,
  },
  cacheBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
  },
  cacheText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  update: {
    alignItems: "center",
  },
  updateLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  updateValue: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});

export default MarketStatus;
