import { View, StyleSheet, Text } from "react-native";
import { HomeScreen } from "./src/screens/HomeScreen";
import { CalculatorScreen } from "./src/screens/CalculatorScreen";
import { AnalyticsScreen } from "./src/screens/AnalyticsScreen";
import { BottomNav } from "./src/components/BottomNav";
import { colors } from "./src/theme/colors";
import { useState } from "react";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<"home" | "calculator" | "analytics">("home");

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <HomeScreen />;
      case "calculator":
        return <CalculatorScreen />;
      case "analytics":
        return <AnalyticsScreen />;
      default:
        return (
          <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
            <Text style={{ color: "#fff", fontSize: 18 }}>Próximamente</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      <BottomNav currentScreen={currentScreen} onScreenChange={setCurrentScreen} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});