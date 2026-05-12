import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

type Props = {
  title: string;
  subtitle?: string;
  loading?: boolean;
  onRefresh?: () => void;
};

export function Header({ title, subtitle, loading, onRefresh }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.titleLeft}>
          <Text style={styles.brand}>AL CAMBIO</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.titleRight}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            onRefresh && (
              <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn} activeOpacity={0.6}>
                <MaterialIcons name="refresh" size={20} color={colors.primary} />
              </TouchableOpacity>
            )
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleLeft: {
    flex: 1,
  },
  brand: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 3,
    color: colors.primary,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  titleRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Header;
