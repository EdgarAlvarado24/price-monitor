import { View, StyleSheet } from "react-native";
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  Easing,
  withSequence,
} from "react-native-reanimated";
import { useEffect } from "react";
import { colors } from "../theme/colors";

export function SkeletonCard() {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <View style={styles.badge} />
      <View style={styles.priceLine}>
        <View style={styles.currencySign} />
        <View style={styles.priceText} />
      </View>
      <View style={styles.changeLine}>
        <View style={styles.changeText} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    padding: 20,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  badge: {
    width: 80,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.shimmer,
  },
  priceLine: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  currencySign: {
    width: 30,
    height: 18,
    borderRadius: 4,
    backgroundColor: colors.shimmer,
    marginBottom: 4,
  },
  priceText: {
    width: 160,
    height: 32,
    borderRadius: 6,
    backgroundColor: colors.shimmer,
  },
  changeLine: {
    flexDirection: "row",
    marginTop: 4,
  },
  changeText: {
    width: 120,
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.shimmer,
  },
});

export default SkeletonCard;
