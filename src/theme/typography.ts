import { TextStyle } from "react-native";

export const typography: Record<string, TextStyle> = {
  h1: {
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: -1,
  },
  h2: {
    fontSize: 32,
    fontWeight: "700",
  },
  h3: {
    fontSize: 24,
    fontWeight: "700",
  },
  body: {
    fontSize: 16,
    fontWeight: "400",
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: "600",
  },
  caption: {
    fontSize: 12,
    fontWeight: "500",
  },
  tiny: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1,
  },
  badge: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
};
