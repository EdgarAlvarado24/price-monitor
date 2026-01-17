import { View, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

type Item = {
  name: keyof typeof MaterialIcons.glyphMap;
  active?: boolean;
};

const items: Item[] = [
  { name: "home", active: true },
  { name: "calculate" },
  { name: "analytics" },
  { name: "settings" },
];

export function BottomNav() {
  return (
    <View style={styles.container}>
      {items.map((item) => (
        <TouchableOpacity key={item.name} style={styles.button}>
          <MaterialIcons
            name={item.name}
            size={26}
            color={item.active ? colors.primary : "rgba(255,255,255,0.25)"}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 96,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 16,
  },
  button: {
    padding: 12,
  },
});
