import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { MaterialIcons } from "@expo/vector-icons";

type Props = {
  open: boolean;
  lastUpdate: string;
  isUsingCache?: boolean;
};

export function MarketStatus({ open, lastUpdate, isUsingCache }: Props) {
  return (
    <View style={styles.container}>
      {isUsingCache && (
        <View style={styles.cacheBadge}>
          <MaterialIcons name="offline-bolt" size={14} color={colors.primary} />
          <Text style={styles.cacheText}>MODO OFFLINE</Text>
        </View>
      )}

      <View style={styles.badge}>
        <View
          style={[
            styles.dot,
            { backgroundColor: open ? colors.green : colors.red },
          ]}
        />
        <Text style={styles.badgeText}>
          {open ? "MERCADO ABIERTO" : "MERCADO CERRADO"}
        </Text>
      </View>

      <View style={styles.update}>
        <Text style={styles.updateLabel}>ÚLTIMA ACTUALIZACIÓN</Text>
        <Text style={styles.updateText}>{lastUpdate}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 48,
    alignItems: "center",
  },
  cacheBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(79,209,197,0.1)",
    marginBottom: 12,
  },
  cacheText: {
    color: colors.primary,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "700",
    marginLeft: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  badgeText: {
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "700",
  },
  update: {
    marginTop: 16,
    alignItems: "center",
  },
  updateLabel: {
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "700",
  },
  updateText: {
    color: colors.textLight,
    fontSize: 14,
    marginTop: 4,
  },
});
