// export const THEME_SEED_COLOR = "#FFD101";
// export const THEME_SEED_COLOR = "#003B6D";
export const THEME_SEED_COLOR = "#66CCFF";

type Hsl = {
  h: number;
  s: number;
  l: number;
};

type Rgb = {
  r: number;
  g: number;
  b: number;
};

type Oklch = {
  l: number;
  c: number;
  h: number;
};

export type ColorMode = "light" | "dark";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const normalizeHue = (hue: number) => ((hue % 360) + 360) % 360;

const hexToRgb = (hex: string): Rgb => {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((char) => char + char).join("")
    : normalized;

  return {
    r: Number.parseInt(value.slice(0, 2), 16) / 255,
    g: Number.parseInt(value.slice(2, 4), 16) / 255,
    b: Number.parseInt(value.slice(4, 6), 16) / 255,
  };
};

const rgbToHsl = ({ r, g, b }: Rgb): Hsl => {
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

const srgbToLinear = (value: number) => {
  if (value <= 0.04045) {
    return value / 12.92;
  }

  return ((value + 0.055) / 1.055) ** 2.4;
};

const linearToSrgb = (value: number) => {
  if (value <= 0.0031308) {
    return 12.92 * value;
  }

  return 1.055 * value ** (1 / 2.4) - 0.055;
};

const rgbToOklch = ({ r, g, b }: Rgb): Oklch => {
  const linearR = srgbToLinear(r);
  const linearG = srgbToLinear(g);
  const linearB = srgbToLinear(b);

  const l = Math.cbrt(0.4122214708 * linearR + 0.5363325363 * linearG + 0.0514459929 * linearB);
  const m = Math.cbrt(0.2119034982 * linearR + 0.6806995451 * linearG + 0.1073969566 * linearB);
  const s = Math.cbrt(0.0883024619 * linearR + 0.2817188376 * linearG + 0.6309787005 * linearB);

  const oklabL = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const oklabA = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const oklabB = -0.0311359616 * l + 0.7827717662 * m - 0.7518163563 * s;

  return {
    l: oklabL,
    c: Math.sqrt(oklabA ** 2 + oklabB ** 2),
    h: normalizeHue(Math.atan2(oklabB, oklabA) * 180 / Math.PI),
  };
};

const oklchToRgb = ({ l, c, h }: Oklch): Rgb => {
  const hueRadians = h * Math.PI / 180;
  const a = Math.cos(hueRadians) * c;
  const b = Math.sin(hueRadians) * c;

  const okL = l + 0.3963377774 * a + 0.2158037573 * b;
  const okM = l - 0.1055613458 * a - 0.0638541728 * b;
  const okS = l - 0.0894841775 * a - 1.291485548 * b;

  const okL3 = okL ** 3;
  const okM3 = okM ** 3;
  const okS3 = okS ** 3;

  return {
    r: linearToSrgb(4.0767416621 * okL3 - 3.3077115913 * okM3 + 0.2309699292 * okS3),
    g: linearToSrgb(-1.2684380046 * okL3 + 2.6097574011 * okM3 - 0.3413193965 * okS3),
    b: linearToSrgb(-0.0041960863 * okL3 - 0.7034186147 * okM3 + 1.707614701 * okS3),
  };
};

const isInSrgb = ({ r, g, b }: Rgb) => r >= 0 && r <= 1 && g >= 0 && g <= 1 && b >= 0 && b <= 1;

const fitOklchToSrgb = (color: Oklch): Rgb => {
  let low = 0;
  let high = color.c;
  let fitted = oklchToRgb({ ...color, c: 0 });

  for (let index = 0; index < 24; index += 1) {
    const chroma = (low + high) / 2;
    const candidate = oklchToRgb({ ...color, c: chroma });

    if (isInSrgb(candidate)) {
      fitted = candidate;
      low = chroma;
    } else {
      high = chroma;
    }
  }

  return {
    r: clamp(fitted.r, 0, 1),
    g: clamp(fitted.g, 0, 1),
    b: clamp(fitted.b, 0, 1),
  };
};

const hslValue = ({ h, s, l }: Hsl) => `${h.toFixed(0)} ${s.toFixed(0)}% ${l.toFixed(0)}%`;

const tonalPalette = (hue: number, chroma: number) => (tone: number) => {
  const rgb = fitOklchToSrgb({
    l: clamp(tone, 0, 100) / 100,
    c: chroma,
    h: hue,
  });

  return hslValue(rgbToHsl(rgb));
};

const dynamicTheme = (seedColor: string, mode: ColorMode) => {
  const seed = rgbToOklch(hexToRgb(seedColor));
  const seedHue = seed.c < 0.01 ? 210 : seed.h;
  const sourceChroma = clamp(seed.c, 0.08, 0.18);
  const primary = tonalPalette(seedHue, sourceChroma);
  const secondary = tonalPalette(seedHue, clamp(sourceChroma * 0.34, 0.026, 0.052));
  const tertiary = tonalPalette(normalizeHue(seedHue + 60), clamp(sourceChroma * 0.58, 0.05, 0.095));
  const neutral = tonalPalette(seedHue, 0.012);
  const neutralVariant = tonalPalette(seedHue, 0.028);
  const isDark = mode === "dark";

  return {
    "--background": neutral(isDark ? 6 : 98),
    "--foreground": neutral(isDark ? 90 : 10),
    "--card": neutral(isDark ? 10 : 100),
    "--card-foreground": neutral(isDark ? 90 : 10),
    "--primary": primary(isDark ? 80 : 40),
    "--primary-foreground": primary(isDark ? 20 : 100),
    "--secondary": secondary(isDark ? 30 : 90),
    "--secondary-foreground": secondary(isDark ? 90 : 10),
    "--muted": neutralVariant(isDark ? 30 : 90),
    "--muted-foreground": neutralVariant(isDark ? 80 : 30),
    "--accent": tertiary(isDark ? 30 : 90),
    "--accent-foreground": tertiary(isDark ? 90 : 10),
    "--border": neutralVariant(isDark ? 30 : 80),
    "--input": neutralVariant(isDark ? 30 : 80),
    "--ring": primary(isDark ? 80 : 40),
    "--support-a": tertiary(isDark ? 80 : 40),
    "--support-b": primary(isDark ? 70 : 50),
    "--support-c": secondary(isDark ? 80 : 40),
  };
};

export const applyDynamicTheme = (mode: ColorMode, seedColor = THEME_SEED_COLOR) => {
  const root = document.documentElement;
  const theme = dynamicTheme(seedColor, mode);

  Object.entries(theme).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
};
