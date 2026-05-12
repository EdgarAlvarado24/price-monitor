import { View, StyleSheet, StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { HomeScreen } from "./src/screens/HomeScreen";
import { CalculatorScreen } from "./src/screens/CalculatorScreen";
import { AnalyticsScreen } from "./src/screens/AnalyticsScreen";
import { BottomNav } from "./src/components/BottomNav";
import { colors } from "./src/theme/colors";
import { useState } from "react";

type Screen = "home" | "calculator" | "analytics";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <HomeScreen />;
      case "calculator":
        return <CalculatorScreen />;
      case "analytics":
        return <AnalyticsScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.container}>
          <View style={styles.screenContent}>
            {renderScreen()}
          </View>
          <BottomNav currentScreen={currentScreen} onScreenChange={setCurrentScreen} />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContent: {
    flex: 1,
  },
});
