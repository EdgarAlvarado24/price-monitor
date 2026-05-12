import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

type NavItem = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  screen: "home" | "calculator" | "analytics";
};

const items: NavItem[] = [
  { icon: "home", label: "Inicio", screen: "home" },
  { icon: "calculate", label: "Calculadora", screen: "calculator" },
  { icon: "analytics", label: "Análisis", screen: "analytics" },
];

type Props = {
  currentScreen: "home" | "calculator" | "analytics";
  onScreenChange: (screen: "home" | "calculator" | "analytics") => void;
};

export function BottomNav({ currentScreen, onScreenChange }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {items.map((item) => {
          const isActive = currentScreen === item.screen;
          return (
            <TouchableOpacity
              key={item.screen}
              style={styles.button}
              onPress={() => onScreenChange(item.screen)}
              activeOpacity={0.6}
            >
              <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                <MaterialIcons
                  name={item.icon}
                  size={22}
                  color={isActive ? colors.primary : colors.textDim}
                />
              </View>
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  inner: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 72,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: colors.primaryLight,
  },
  label: {
    fontSize: 10,
    color: colors.textDim,
    fontWeight: "600",
    marginTop: 2,
  },
  labelActive: {
    color: colors.primary,
  },
});

export default BottomNav;
