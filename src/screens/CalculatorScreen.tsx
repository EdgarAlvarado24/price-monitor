import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Pressable } from "react-native";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { colors } from "../theme/colors";
import { Header } from "../components/Header";
import { useRates } from "../hooks/useRates";
import { useState, useCallback } from "react";
import { ConversionType } from "../types/rates";
import { conversionOptions, formatNumber } from "../data/constants";

// Estimación de la próxima tasa BCV (+2% de la actual como simulación)
const estimateNextBcvRate = (currentRate: number): number => {
  return currentRate * 1.02;
};

export function CalculatorScreen() {
  const { rates, loading, isUsingCache, error, refresh } = useRates();
  const [amount, setAmount] = useState("");
  const [conversionType, setConversionType] = useState<ConversionType>("usd-to-bs");
  const [showSelector, setShowSelector] = useState(false);
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [useNextRate, setUseNextRate] = useState(false);

  const handleKeyPress = useCallback((key: string) => {
    if (key === "backspace") {
      setAmount(prev => prev.slice(0, -1));
    } else if (key === "." && amount.includes(".")) {
      return;
    } else if (/^[0-9.]$/.test(key)) {
      setAmount(prev => prev + key);
    }
  }, [amount]);

  const handleClear = useCallback(() => {
    setAmount("");
  }, []);

  if (loading || !rates) {
    return (
      <View style={styles.container}>
        <Header title="Calculadora" subtitle="Cargando tasas..." loading />
        <View style={styles.loadingContent}>
          <Text style={styles.loadingText}>Preparando calculadora...</Text>
        </View>
      </View>
    );
  }

  const selectedOption = conversionOptions.find(opt => opt.key === conversionType)!;
  const rateKey = selectedOption.rateKey as keyof typeof rates.current;
  let rate = Number(rates.current[rateKey]) || 0;

  if (useNextRate && (rateKey === "usd" || rateKey === "eur")) {
    rate = estimateNextBcvRate(rate);
  }

  const isToBs = conversionType.includes("to-bs");
  const convertedAmount = amount
    ? isToBs
      ? parseFloat(amount) * rate
      : parseFloat(amount) / rate
    : 0;

  const currentRate = Number(rates.current[rateKey]) || 0;
  const nextRate = (rateKey === "usd" || rateKey === "eur") ? estimateNextBcvRate(currentRate) : currentRate;

  const doCopy = async () => {
    if (!amount) return;
    const text = `${amount} ${selectedOption.from} = ${convertedAmount.toFixed(2)} ${selectedOption.to}`;
    await Clipboard.setStringAsync(text);
    setShowCopyMessage(true);
    setTimeout(() => setShowCopyMessage(false), 2000);
  };

  const doPaste = async () => {
    const clipboardContent = await Clipboard.getStringAsync();
    if (!clipboardContent) return;
    let numericValue = clipboardContent.replace(/\./g, "").replace(/,/g, ".");
    numericValue = numericValue.replace(/[^0-9.]/g, "");
    if (numericValue) {
      setAmount(numericValue);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Calculadora"
        subtitle="Conversión de divisas"
        loading={loading}
        onRefresh={refresh}
      />

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.card}>
          {/* Indicador de caché */}
          {isUsingCache && (
            <View style={styles.cacheIndicator}>
              <MaterialIcons name="offline-bolt" size={14} color={colors.primary} />
              <Text style={styles.cacheText}>Usando datos cacheados</Text>
            </View>
          )}

          {/* Selector de conversión */}
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowSelector(true)}
            activeOpacity={0.7}
          >
            <MaterialIcons name={selectedOption.icon as keyof typeof MaterialIcons.glyphMap} size={18} color={colors.primary} />
            <Text style={styles.selectorText}>{selectedOption.label}</Text>
            <MaterialIcons name="expand-more" size={20} color={colors.primary} />
          </TouchableOpacity>

          {/* Toggle próxima tasa */}
          {(rateKey === "usd" || rateKey === "eur") && (
            <TouchableOpacity
              style={[styles.nextRateToggle, useNextRate && styles.nextRateToggleActive]}
              onPress={() => setUseNextRate(!useNextRate)}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={useNextRate ? "toggle-on" : "toggle-off"}
                size={20}
                color={useNextRate ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.nextRateText, useNextRate && styles.nextRateTextActive]}>
                Próxima tasa BCV
              </Text>
            </TouchableOpacity>
          )}

          {/* Input con paste */}
          <View style={styles.inputRow}>
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>MONTO EN {selectedOption.from}</Text>
              <View style={styles.inputBox}>
                <Text style={styles.inputText}>{amount || "0"}</Text>
                {amount.length > 0 && (
                  <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
                    <MaterialIcons name="close" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <TouchableOpacity style={styles.actionBtn} onPress={doPaste}>
              <MaterialIcons name="content-paste" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Resultado con copy */}
          <View style={styles.resultRow}>
            <View style={styles.resultSection}>
              <Text style={styles.inputLabel}>EQUIVALENTE EN {selectedOption.to}</Text>
              <Text style={styles.resultText}>
                {convertedAmount > 0 ? formatNumber(convertedAmount) : "0.00"}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.actionBtn, !amount && styles.actionBtnDisabled]}
              onPress={doCopy}
              disabled={!amount}
            >
              <MaterialIcons
                name="content-copy"
                size={18}
                color={!amount ? colors.textDim : colors.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Tasas actuales */}
          <View style={styles.ratesInfo}>
            <View style={styles.rateRow}>
              <Text style={styles.rateLabel}>Tasa actual:</Text>
              <Text style={styles.rateValue}>Bs. {formatNumber(currentRate)}</Text>
            </View>
            {useNextRate && (rateKey === "usd" || rateKey === "eur") && (
              <View style={[styles.rateRow, styles.rateRowNext]}>
                <Text style={[styles.rateLabel, { color: colors.yellow }]}>Próxima tasa (est.):</Text>
                <Text style={[styles.rateValue, { color: colors.yellow }]}>Bs. {formatNumber(nextRate)}</Text>
              </View>
            )}
            <View style={styles.rateRow}>
              <Text style={styles.rateLabel}>USDT (P2P):</Text>
              <Text style={[styles.rateValue, { color: colors.usdtColor }]}>Bs. {formatNumber(rates.current.usdt)}</Text>
            </View>
          </View>

          {/* Mensaje de copiado */}
          {showCopyMessage && (
            <Animated.View entering={FadeIn.duration(200)} style={styles.copyMessage}>
              <MaterialIcons name="check-circle" size={14} color={colors.green} />
              <Text style={styles.copyMessageText}>¡Resultado copiado!</Text>
            </Animated.View>
          )}

          {/* Teclado numérico */}
          <View style={styles.keypad}>
            {[["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"], [".", "0", "backspace"]].map((row, i) => (
              <View key={i} style={styles.keyRow}>
                {row.map((key) => (
                  <TouchableOpacity
                    key={key}
                    style={styles.key}
                    onPress={() => handleKeyPress(key)}
                    activeOpacity={0.6}
                  >
                    {key === "backspace" ? (
                      <MaterialIcons name="backspace" size={22} color={colors.text} />
                    ) : (
                      <Text style={styles.keyText}>{key}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </Animated.View>
      </View>

      {/* Modal selector de conversión */}
      <Modal
        visible={showSelector}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSelector(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowSelector(false)}>
          <Pressable style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona conversión</Text>
            <FlatList
              data={conversionOptions}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.key === conversionType && styles.optionSelected,
                  ]}
                  onPress={() => {
                    setConversionType(item.key as ConversionType);
                    setUseNextRate(false);
                    setShowSelector(false);
                  }}
                >
                  <MaterialIcons
                    name={item.icon as keyof typeof MaterialIcons.glyphMap}
                    size={18}
                    color={item.key === conversionType ? "#fff" : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      item.key === conversionType && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.key === conversionType && (
                    <MaterialIcons name="check" size={18} color="#fff" />
                  )}
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
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
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cacheIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    marginBottom: 16,
  },
  cacheText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "600",
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
    alignSelf: "center",
  },
  selectorText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  nextRateToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 6,
    marginBottom: 16,
  },
  nextRateToggleActive: {},
  nextRateText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  nextRateTextActive: {
    color: colors.yellow,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 16,
  },
  inputSection: {
    flex: 1,
  },
  inputLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputText: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
  },
  clearBtn: {
    padding: 4,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 16,
  },
  resultSection: {
    flex: 1,
  },
  resultText: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: "800",
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  actionBtnDisabled: {
    opacity: 0.4,
  },
  ratesInfo: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    padding: 14,
    gap: 6,
    marginBottom: 12,
  },
  rateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rateRowNext: {
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rateLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  rateValue: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  copyMessage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    marginBottom: 8,
  },
  copyMessageText: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "600",
  },
  keypad: {
    gap: 6,
  },
  keyRow: {
    flexDirection: "row",
    gap: 6,
  },
  key: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  keyText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.elevated,
    borderRadius: 24,
    padding: 20,
    width: "82%",
    maxHeight: "70%",
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 2,
  },
  optionSelected: {
    backgroundColor: colors.primary,
  },
  optionText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  optionTextSelected: {
    color: "#fff",
  },
});

export default CalculatorScreen;
