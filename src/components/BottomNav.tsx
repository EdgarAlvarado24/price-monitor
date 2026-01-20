import { View, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

type Item = {
  name: keyof typeof MaterialIcons.glyphMap;
  screen: "home" | "calculator" | "analytics";
};

const items: Item[] = [
  { name: "home", screen: "home" },
  { name: "calculate", screen: "calculator" },
  { name: "analytics", screen: "analytics" },
];

type Props = {
  currentScreen: "home" | "calculator" | "analytics";
  onScreenChange: (screen: "home" | "calculator" | "analytics") => void;
};

export function BottomNav({ currentScreen, onScreenChange }: Props) {
  return (
    <View style={styles.container}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.name}
          style={styles.button}
          onPress={() => onScreenChange(item.screen)}
        >
          <MaterialIcons
            name={item.name}
            size={26}
            color={currentScreen === item.screen ? colors.primary : "rgba(255,255,255,0.25)"}
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
