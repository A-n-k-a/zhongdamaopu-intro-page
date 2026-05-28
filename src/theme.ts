export const THEME_SEED_COLOR = "#FFD101";
// export const THEME_SEED_COLOR = "#003B6D";

type Hsl = {
  h: number;
  s: number;
  l: number;
};

export type ColorMode = "light" | "dark";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const normalizeHue = (hue: number) => ((hue % 360) + 360) % 360;

const hexToHsl = (hex: string): Hsl => {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((char) => char + char).join("")
    : normalized;

  const r = Number.parseInt(value.slice(0, 2), 16) / 255;
  const g = Number.parseInt(value.slice(2, 4), 16) / 255;
  const b = Number.parseInt(value.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) {
    return { h: 0, s: 0, l: lightness * 100 };
  }

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue = 0;

  if (max === r) {
    hue = 60 * (((g - b) / delta) % 6);
  } else if (max === g) {
    hue = 60 * ((b - r) / delta + 2);
  } else {
    hue = 60 * ((r - g) / delta + 4);
  }

  return {
    h: normalizeHue(hue),
    s: saturation * 100,
    l: lightness * 100,
  };
};

const tone = (base: Hsl, lightness: number, saturationScale = 1, hueShift = 0) => {
  const saturation = clamp(base.s * saturationScale, 8, 100);
  return `${normalizeHue(base.h + hueShift).toFixed(0)} ${saturation.toFixed(0)}% ${lightness.toFixed(0)}%`;
};

const dynamicTheme = (seedColor: string, mode: ColorMode) => {
  const seed = hexToHsl(seedColor);
  const isDark = mode === "dark";

  return {
    "--background": tone(seed, isDark ? 10 : 98, isDark ? 0.18 : 0.16, isDark ? 178 : 0),
    "--foreground": tone(seed, isDark ? 92 : 14, isDark ? 0.26 : 0.2, isDark ? 178 : 200),
    "--card": tone(seed, isDark ? 14 : 100, isDark ? 0.22 : 0.08, isDark ? 178 : 0),
    "--card-foreground": tone(seed, isDark ? 92 : 14, isDark ? 0.26 : 0.2, isDark ? 178 : 200),
    "--primary": tone(seed, isDark ? 62 : 50, isDark ? 0.92 : 1),
    "--primary-foreground": tone(seed, isDark ? 10 : 12, isDark ? 0.18 : 0.18, isDark ? 178 : 200),
    "--secondary": tone(seed, isDark ? 22 : 90, isDark ? 0.38 : 0.34, 128),
    "--secondary-foreground": tone(seed, isDark ? 92 : 16, isDark ? 0.38 : 0.38, 128),
    "--muted": tone(seed, isDark ? 20 : 91, isDark ? 0.16 : 0.14, 178),
    "--muted-foreground": tone(seed, isDark ? 70 : 43, isDark ? 0.16 : 0.16, 200),
    "--accent": tone(seed, isDark ? 24 : 92, isDark ? 0.42 : 0.5, 168),
    "--accent-foreground": tone(seed, isDark ? 92 : 22, isDark ? 0.42 : 0.55, 168),
    "--border": tone(seed, isDark ? 26 : 84, isDark ? 0.14 : 0.12, 178),
    "--input": tone(seed, isDark ? 26 : 84, isDark ? 0.14 : 0.12, 178),
    "--ring": tone(seed, isDark ? 58 : 42, 0.96),
    "--support-a": tone(seed, isDark ? 64 : 38, 0.58, 116),
    "--support-b": tone(seed, isDark ? 66 : 46, 0.62, -28),
    "--support-c": tone(seed, isDark ? 68 : 45, 0.62, 168),
  };
};

export const applyDynamicTheme = (mode: ColorMode, seedColor = THEME_SEED_COLOR) => {
  const root = document.documentElement;
  const theme = dynamicTheme(seedColor, mode);

  Object.entries(theme).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
};
