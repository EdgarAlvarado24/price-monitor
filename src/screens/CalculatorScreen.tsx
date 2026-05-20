import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Pressable, TextInput } from "react-native";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { colors } from "../theme/colors";
import { Header } from "../components/Header";
import { useRates } from "../hooks/useRates";
import { useState, useCallback, useEffect, useRef } from "react";
import { ConversionType, RatesData } from "../types/rates";
import { conversionOptions, formatNumber } from "../data/constants";

/** Parsea string formato venezolano a número (acepta . y , como decimal) */
function parseNum(s: string): number | null {
  if (!s || /^[.,\s]*$/.test(s)) return null;
  let n = s.trim();
  if (n.includes(",") && n.includes(".")) {
    n = n.replace(/\./g, "").replace(",", ".");
  } else if (n.includes(",")) {
    n = n.replace(",", ".");
  } else if (n.includes(".")) {
    const parts = n.split(".");
    if (parts.length > 2) {
      n = n.replace(/\./g, "");
    } else if (parts.length === 2 && parts[1].length !== 2 && parts[0].length <= 3 && parts[1].length === 3) {
      n = n.replace(".", "");
    }
  }
  const num = parseFloat(n);
  return isNaN(num) ? null : num;
}

/** Normaliza el input al formato venezolano (coma como decimal) */
function normalizeDecimalInput(text: string): string {
  if (text.includes(",") && text.includes(".")) {
    return text.replace(/\./g, "").replace(/,.*$/, "");
  }
  if (text.includes(".") && !text.includes(",")) {
    const parts = text.split(".");
    if (parts.length === 2 && parts[0].length <= 3 && parts[1].length === 3) {
      return text.replace(".", "");
    }
    return text.replace(".", ",");
  }
  return text;
}

export function CalculatorScreen() {
  const { rates, loading, isUsingCache, error, refresh } = useRates();
  const [conversionType, setConversionType] = useState<ConversionType>("dolar_bcv");
  const [showSelector, setShowSelector] = useState(false);
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [bsInput, setBsInput] = useState("");
  const [divisaInput, setDivisaInput] = useState("");
  const [activeField, setActiveField] = useState<"bs" | "divisa">("bs");

  const bsRef = useRef<TextInput>(null);
  const divisaRef = useRef<TextInput>(null);

  const selectedOption = conversionOptions.find(opt => opt.key === conversionType)!;
  const rate = rates
    ? Number(rates.current[selectedOption.rateKey as keyof RatesData["current"]]) || 0
    : 0;

  const recalc = useCallback((field: "bs" | "divisa", raw: string, currentRate: number) => {
    if (!raw) {
      if (field === "bs") {
        setDivisaInput("");
      } else {
        setBsInput("");
      }
      return;
    }
    const num = parseNum(raw);
    if (num === null || num < 0) return;
    if (field === "bs") {
      setDivisaInput(formatNum((num / currentRate).toFixed(2)));
    } else {
      setBsInput(formatNum((num * currentRate).toFixed(2)));
    }
  }, []);

  /** Formatea un número como string manteniendo el separador "," */
  function formatNum(s: string): string {
    return s.replace(".", ",");
  }

  // Recalcular cuando cambia el tipo de conversión
  const prevRateKeyRef = useRef(selectedOption.rateKey);
  useEffect(() => {
    if (prevRateKeyRef.current !== selectedOption.rateKey) {
      prevRateKeyRef.current = selectedOption.rateKey;
      if (!bsInput && !divisaInput) return;
      if (activeField === "bs") {
        const num = parseNum(bsInput);
        if (num !== null && rate > 0) {
          setDivisaInput(formatNum((num / rate).toFixed(2)));
        }
      } else {
        const num = parseNum(divisaInput);
        if (num !== null && rate > 0) {
          setBsInput(formatNum((num * rate).toFixed(2)));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOption.rateKey]);

  const handleChangeText = useCallback((field: "bs" | "divisa", text: string) => {
    // Permitir solo dígitos, coma y punto
    const cleaned = text.replace(/[^0-9,.]/g, "");
    // Solo permitir un separador decimal
    const parts = cleaned.split(/[,.]/);
    if (parts.length > 2) return; // más de un separador
    const normalized = normalizeDecimalInput(cleaned);

    if (field === "bs") {
      setBsInput(normalized);
      recalc("bs", normalized, rate);
    } else {
      setDivisaInput(normalized);
      recalc("divisa", normalized, rate);
    }
  }, [rate, recalc]);

  const handleClear = useCallback(() => {
    setBsInput("");
    setDivisaInput("");
    setActiveField("bs");
    bsRef.current?.focus();
  }, []);

  const handleClearField = useCallback((field: "bs" | "divisa") => {
    if (field === "bs") {
      setBsInput("");
      setDivisaInput("");
      bsRef.current?.focus();
    } else {
      setDivisaInput("");
      setBsInput("");
      divisaRef.current?.focus();
    }
    setActiveField(field);
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

  const doPaste = async () => {
    const clipboardContent = await Clipboard.getStringAsync();
    if (!clipboardContent) return;
    let numericValue = clipboardContent.replace(/\./g, "").replace(/,/g, ".");
    numericValue = numericValue.replace(/[^0-9.]/g, "");
    if (numericValue) {
      const num = parseFloat(numericValue);
      if (!isNaN(num) && num >= 0) {
        const raw = num % 1 === 0 ? String(num) : numericValue;
        if (activeField === "bs") {
          setBsInput(raw.replace(".", ","));
          recalc("bs", raw, rate);
        } else {
          setDivisaInput(raw.replace(".", ","));
          recalc("divisa", raw, rate);
        }
      }
    }
  };

  const doCopy = async () => {
    const result = bsInput
      ? `${formatNumber(parseNum(bsInput)!)} Bs → ${
          divisaInput
            ? formatNumber(parseNum(divisaInput)!)
            : "—"
        } ${selectedOption.simbolo}`
      : divisaInput
        ? `${formatNumber(parseNum(divisaInput)!)} ${selectedOption.simbolo} → ${
            bsInput ? formatNumber(parseNum(bsInput)!) : "—"
          } Bs`
        : null;
    if (!result) return;
    await Clipboard.setStringAsync(result);
    setShowCopyMessage(true);
    setTimeout(() => setShowCopyMessage(false), 2000);
  };

  const isInput = !!(bsInput || divisaInput);

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

          {/* Selector de tipo */}
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowSelector(true)}
            activeOpacity={0.7}
          >
            <MaterialIcons name={selectedOption.icon as keyof typeof MaterialIcons.glyphMap} size={18} color={colors.primary} />
            <Text style={styles.selectorText}>{selectedOption.label}</Text>
            <MaterialIcons name="expand-more" size={20} color={colors.primary} />
          </TouchableOpacity>

          {/* Tasa actual */}
          <View style={styles.rateBadge}>
            <Text style={styles.rateBadgeText}>
              1 {selectedOption.simbolo} = {formatNumber(rate)} Bs
            </Text>
          </View>

          {/* Bs INPUT */}
          <Pressable
            style={[styles.inputSection, activeField === "bs" && styles.inputSectionActive]}
            onPress={() => {
              setActiveField("bs");
              bsRef.current?.focus();
            }}
          >
            <Text style={styles.inputLabel}>BOLÍVARES (BS)</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputPrefix}>Bs</Text>
              <TextInput
                ref={bsRef}
                style={styles.inputValue}
                value={bsInput}
                onChangeText={(text) => handleChangeText("bs", text)}
                onFocus={() => setActiveField("bs")}
                keyboardType="decimal-pad"
                placeholder="0,00"
                placeholderTextColor={colors.textDim}
                selectionColor={colors.primary}
                cursorColor={colors.primary}
              />
              {bsInput.length > 0 && (
                <TouchableOpacity
                  style={styles.clearFieldBtn}
                  onPress={() => handleClearField("bs")}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialIcons name="close" size={16} color={colors.textDim} />
                </TouchableOpacity>
              )}
            </View>
          </Pressable>

          {/* Divisa INPUT */}
          <Pressable
            style={[styles.inputSection, activeField === "divisa" && styles.inputSectionActive]}
            onPress={() => {
              setActiveField("divisa");
              divisaRef.current?.focus();
            }}
          >
            <Text style={styles.inputLabel}>{selectedOption.label.toUpperCase()} ({selectedOption.simbolo})</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputPrefix}>{selectedOption.simbolo}</Text>
              <TextInput
                ref={divisaRef}
                style={styles.inputValue}
                value={divisaInput}
                onChangeText={(text) => handleChangeText("divisa", text)}
                onFocus={() => setActiveField("divisa")}
                keyboardType="decimal-pad"
                placeholder="0,00"
                placeholderTextColor={colors.textDim}
                selectionColor={colors.primary}
                cursorColor={colors.primary}
              />
              {divisaInput.length > 0 && (
                <TouchableOpacity
                  style={styles.clearFieldBtn}
                  onPress={() => handleClearField("divisa")}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialIcons name="close" size={16} color={colors.textDim} />
                </TouchableOpacity>
              )}
            </View>
          </Pressable>

          {/* Resultado complementario */}
          {isInput && (
            <View style={styles.complementaryResult}>
              <MaterialIcons name="swap-vert" size={14} color={colors.textMuted} />
              <Text style={styles.complementaryText}>
                {activeField === "bs"
                  ? `${formatNumber(parseNum(bsInput)!)} Bs = ${divisaInput || "—"} ${selectedOption.simbolo}`
                  : `${formatNumber(parseNum(divisaInput)!)} ${selectedOption.simbolo} = ${bsInput || "—"} Bs`}
              </Text>
            </View>
          )}

          {/* Botones de acción: copiar, pegar y limpiar */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, !isInput && styles.actionBtnDisabled]}
              onPress={doCopy}
              disabled={!isInput}
            >
              <MaterialIcons
                name="content-copy"
                size={16}
                color={!isInput ? colors.textDim : colors.primary}
              />
              <Text style={[styles.actionBtnText, !isInput && { color: colors.textDim }]}>Copiar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={doPaste}>
              <MaterialIcons name="content-paste" size={16} color={colors.primary} />
              <Text style={styles.actionBtnText}>Pegar</Text>
            </TouchableOpacity>
            {isInput && (
              <TouchableOpacity style={[styles.actionBtn, styles.actionBtnClear]} onPress={handleClear}>
                <MaterialIcons name="delete-outline" size={16} color={colors.red} />
                <Text style={[styles.actionBtnText, { color: colors.red }]}>Limpiar</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Mensaje de copiado */}
          {showCopyMessage && (
            <Animated.View entering={FadeIn.duration(200)} style={styles.copyMessage}>
              <MaterialIcons name="check-circle" size={14} color={colors.green} />
              <Text style={styles.copyMessageText}>¡Resultado copiado!</Text>
            </Animated.View>
          )}

          {/* Mini resumen de tasas */}
          <View style={styles.ratesFooter}>
            <Text style={styles.ratesFooterTitle}>Tasas de referencia</Text>
            <View style={styles.ratesFooterRow}>
              <Text style={styles.ratesFooterLabel}>🇺🇸 Dólar BCV</Text>
              <Text style={styles.ratesFooterValue}>Bs. {formatNumber(rates.current.usd)}</Text>
            </View>
            <View style={styles.ratesFooterRow}>
              <Text style={styles.ratesFooterLabel}>🇪🇺 Euro BCV</Text>
              <Text style={styles.ratesFooterValue}>Bs. {formatNumber(rates.current.eur)}</Text>
            </View>
            <View style={styles.ratesFooterRow}>
              <Text style={styles.ratesFooterLabel}>₿ USDT (P2P)</Text>
              <Text style={[styles.ratesFooterValue, { color: colors.usdtColor }]}>Bs. {formatNumber(rates.current.usdt)}</Text>
            </View>
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
            <Text style={styles.modalTitle}>Selecciona tipo de cambio</Text>
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
    marginBottom: 20,
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
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignSelf: "center",
  },
  selectorText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  rateBadge: {
    alignItems: "center",
    marginBottom: 20,
  },
  rateBadgeText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
  inputSection: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputSectionActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(0,212,170,0.06)",
  },
  inputLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputPrefix: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  inputValue: {
    flex: 1,
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "right",
    paddingVertical: 0,
    fontVariant: ["tabular-nums"],
  },
  clearFieldBtn: {
    marginLeft: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },
  complementaryResult: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    marginBottom: 4,
  },
  complementaryText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 4,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionBtnClear: {
    backgroundColor: "rgba(255,82,82,0.1)",
  },
  actionBtnDisabled: {
    opacity: 0.4,
  },
  actionBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  copyMessage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  copyMessageText: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "600",
  },
  ratesFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ratesFooterTitle: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  ratesFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  ratesFooterLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  ratesFooterValue: {
    color: colors.textSecondary,
    fontSize: 12,
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
