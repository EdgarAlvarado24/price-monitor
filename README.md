# 💱 Al Cambio — Price Monitor v2.0.0

Monitor de tasas de cambio para Venezuela. Consulta el **Dólar BCV**, **Euro BCV** y **USDT P2P** en tiempo real, con calculadora de conversión y análisis histórico.

```
🇻🇪 Hecho en Venezuela para venezolanos
```

## ✨ Funcionalidades

### 🏠 Tasas del día
- **Dólar BCV** — Tasa oficial del Banco Central de Venezuela
- **Euro BCV** — Tasa oficial del euro
- **USDT (P2P)** — Precio del USDT en el mercado P2P de Binance (o Yadio en web)
- **Spread** — Diferencia entre la tasa BCV y el USDT P2P
- **Estado del mercado** — Indicador de mercado abierto/cerrado (horario laboral)
- Pull-to-refresh y auto-refresh cada 5 minutos

### 🧮 Calculadora de conversión
- Conversión bidireccional: Bolívares ↔ Dólar / Euro / USDT
- Formato venezolano (coma decimal)
- Pegar desde el portapapeles
- Copiar resultado al portapapeles
- Mini resumen con todas las tasas de referencia

### 📊 Análisis histórico
- Gráfica de evolución para USD y EUR
- Períodos: 1D, 7D, 1M, 3M, 6M, 1A
- Variación del período, precio mínimo/máximo
- Datos acumulados localmente (hasta 300 snapshots ≈ 25h)

## 📸 Capturas

| Tasas | Calculadora | Análisis |
|-------|-------------|----------|
| (añadir screenshot) | (añadir screenshot) | (añadir screenshot) |

## 🛠 Stack

| Tecnología | Versión |
|---|---|
| [React Native](https://reactnative.dev/) | 0.81.5 |
| [Expo](https://expo.dev/) | SDK 54 |
| [React](https://react.dev/) | 19.1.0 |
| [TypeScript](https://www.typescriptlang.org/) | 5.9 |
| [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) | 4.1 |
| [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | — |
| [Expo Vector Icons](https://docs.expo.dev/guides/icons/) | MaterialIcons |

## 📱 Plataformas

- ✅ Android (nativo)
- ✅ iOS (nativo)
- ✅ Web (via `react-native-web`)

## 🔌 APIs

| Tasa | Fuente | Plataforma |
|------|--------|------------|
| USD BCV | [Quadra API](https://github.com/thehermit3007/Quadra_API) | Todas |
| EUR BCV | [Quadra API](https://github.com/thehermit3007/Quadra_API) | Todas |
| USDT (P2P) | [Binance P2P](https://p2p.binance.com/) | Android / iOS |
| USDT (web) | [Yadio](https://api.yadio.io/) | Web |
| Cross-rates COP/BRL | [Frankfurter API](https://api.frankfurter.app/) | Todas |

## 🎨 Diseño

- Tema **oscuro** (`#0D0D0F` fondo)
- Acento **teal/verde agua** (`#00D4AA`)
- Animaciones sutiles con FadeInDown
- Tarjetas con bordes suaves y shimmer loading
- Navegación inferior con 3 tabs

## 🚀 Primeros pasos

```bash
# Clonar
git clone <repo-url> alcambio
cd alcambio

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npx expo start

# O directamente en web
npx expo start --web

# Build Android
npx expo run:android

# Build iOS
npx expo run:ios
```

### Expo Go (recomendado para desarrollo rápido)

1. Instala [Expo Go](https://expo.dev/client) en tu celular
2. Escanea el QR que aparece al ejecutar `npx expo start`
3. Los cambios se reflejan al instante sin rebuild

## 📁 Estructura

```
src/
├── components/       # UI reutilizable
│   ├── BottomNav     # Navegación inferior
│   ├── Header        # Encabezado con título y refresh
│   ├── MarketStatus  # Indicador mercado abierto/cerrado
│   ├── RateCard      # Tarjeta de tasa de cambio
│   ├── SkeletonCard  # Skeleton loading
│   └── SpreadCard    # Spread BCV vs USDT
├── screens/
│   ├── HomeScreen        # Tasas del día
│   ├── CalculatorScreen  # Conversor de divisas
│   └── AnalyticsScreen   # Análisis histórico
├── data/
│   ├── constants     # Constantes, formatos, opciones
│   └── mock          # Datos mock para desarrollo
├── hooks/
│   └── useRates      # Hook principal (fetch + caché + auto-refresh)
├── services/
│   └── rates.service # Lógica de obtención y persistencia
├── theme/
│   ├── colors        # Paleta de colores
│   └── typography    # Tipografía
└── types/
    └── rates         # Types e interfaces
```

## 🔄 Flujo de datos

```
┌─────────────┐  ┌──────────────────┐  ┌────────────┐
│  Quadra API  │  │  Binance P2P     │  │  Yadio     │
│  (USD, EUR)  │  │  (USDT native)   │  │  USDT web  │
└──────┬───────┘  └────────┬─────────┘  └─────┬──────┘
       │                   │                   │
       └──────────┬────────┴───────────────────┘
                  ▼
         ┌────────────────────┐
         │  rates.service.ts  │
         │  + AsyncStorage    │
         │  (caché + prev)    │
         └────────┬───────────┘
                  ▼
         ┌────────────────────┐
         │   useRates hook    │
         │  (auto-refresh 5m) │
         └────────┬───────────┘
                  ▼
         ┌────────────────────┐
         │      Screens       │
         └────────────────────┘
```

## 🗺 Roadmap

- [ ] Notificaciones de cambio de tasa
- [ ] Más monedas (COP, BRL)
- [ ] Exportar datos históricos
- [ ] Widget Android
- [ ] Modo claro
- [ ] Build para app stores

## 🤝 Licencia

Private — todos los derechos reservados.
