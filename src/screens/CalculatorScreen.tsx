import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { useRates } from "../hooks/useRates";
import { useState } from "react";

type ConversionType = "bs-to-usd" | "usd-to-bs" | "bs-to-eur" | "eur-to-bs";

const conversionOptions = [
  { key: "usd-to-bs", label: "USD → Bs", from: "USD", to: "Bs", rateKey: "usd" },
  { key: "bs-to-usd", label: "Bs → USD", from: "Bs", to: "USD", rateKey: "usd" },
  { key: "eur-to-bs", label: "EUR → Bs", from: "EUR", to: "Bs", rateKey: "eur" },
  { key: "bs-to-eur", label: "Bs → EUR", from: "Bs", to: "EUR", rateKey: "eur" },
];

export function CalculatorScreen() {
  const { rates, loading } = useRates();
  const [amount, setAmount] = useState("");
  const [conversionType, setConversionType] = useState<ConversionType>("usd-to-bs");
  const [showSelector, setShowSelector] = useState(false);

  const handleKeyPress = (key: string) => {
    if (key === "backspace") {
      setAmount(prev => prev.slice(0, -1));
    } else if (key === "." && amount.includes(".")) {
      // No agregar otro punto
      return;
    } else {
      setAmount(prev => prev + key);
    }
  };

  if (loading || !rates) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Cargando...</Text>
        </View>
      </View>
    );
  }

  const selectedOption = conversionOptions.find(opt => opt.key === conversionType)!;
  const rate = rates.current[selectedOption.rateKey as "usd" | "eur"];
  const convertedAmount = amount ? (conversionType.includes("to-bs") ? parseFloat(amount) * rate : parseFloat(amount) / rate) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View entering={FadeInUp.duration(500)}>
          <Text style={styles.title}>CALCULADORA</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(150)} style={styles.card}>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowSelector(true)}
          >
            <Text style={styles.selectorText}>{selectedOption.label}</Text>
            <MaterialIcons name="expand-more" size={24} color={colors.primary} />
          </TouchableOpacity>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Monto en {selectedOption.from}</Text>
            <Text style={styles.input}>{amount || "0"}</Text>
          </View>

          <View style={styles.resultSection}>
            <Text style={styles.label}>Equivalente en {selectedOption.to}</Text>
            <Text style={styles.result}>{convertedAmount.toFixed(2)}</Text>
          </View>

          <Text style={styles.rateText}>Tasa actual: Bs. {rate.toFixed(2)} por {selectedOption.rateKey.toUpperCase()}</Text>

          <View style={styles.keypad}>
            <View style={styles.keyRow}>
              <TouchableOpacity style={styles.key} onPress={() => handleKeyPress("1")}>
                <Text style={styles.keyText}>1</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.key} onPress={() => handleKeyPress("2")}>
                <Text style={styles.keyText}>2</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.key} onPress={() => handleKeyPress("3")}>
                <Text style={styles.keyText}>3</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.keyRow}>
              <TouchableOpacity style={styles.key} onPress={() => handleKeyPress("4")}>
                <Text style={styles.keyText}>4</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.key} onPress={() => handleKeyPress("5")}>
                <Text style={styles.keyText}>5</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.key} onPress={() => handleKeyPress("6")}>
                <Text style={styles.keyText}>6</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.keyRow}>
              <TouchableOpacity style={styles.key} onPress={() => handleKeyPress("7")}>
                <Text style={styles.keyText}>7</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.key} onPress={() => handleKeyPress("8")}>
                <Text style={styles.keyText}>8</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.key} onPress={() => handleKeyPress("9")}>
                <Text style={styles.keyText}>9</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.keyRow}>
              <TouchableOpacity style={styles.key} onPress={() => handleKeyPress(".")}>
                <Text style={styles.keyText}>.</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.key} onPress={() => handleKeyPress("0")}>
                <Text style={styles.keyText}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.key} onPress={() => handleKeyPress("backspace")}>
                <MaterialIcons name="backspace" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>

      <Modal
        visible={showSelector}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSelector(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSelector(false)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={conversionOptions}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.key === conversionType && styles.optionSelected
                  ]}
                  onPress={() => {
                    setConversionType(item.key as ConversionType);
                    setShowSelector(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    item.key === conversionType && styles.optionTextSelected
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 32,
    letterSpacing: 2,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 40,
    padding: 32,
    alignItems: "center",
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30,30,35,0.5)",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 24,
    minWidth: 150,
    justifyContent: "space-between",
  },
  selectorText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  inputSection: {
    width: "100%",
    marginBottom: 24,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(30,30,35,0.3)",
    borderRadius: 16,
    padding: 16,
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  resultSection: {
    width: "100%",
    marginBottom: 16,
  },
  result: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
  },
  rateText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
  },
  keypad: {
    marginTop: 24,
    width: "100%",
  },
  keyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  key: {
    backgroundColor: "rgba(30,30,35,0.5)",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 2,
  },
  keyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    width: "80%",
    maxHeight: "60%",
  },
  option: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 2,
  },
  optionSelected: {
    backgroundColor: colors.primary,
  },
  optionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  optionTextSelected: {
    color: "#fff",
  },
});