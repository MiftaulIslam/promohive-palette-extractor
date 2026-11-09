/* Pure color logic for the Brand Palette Extractor: no React, no DOM, so it runs on the server and in Node checks too. */

export type RGB = [number, number, number];
export interface Cluster { rgb: RGB; share: number }

export const WHITE: RGB = [255, 255, 255];
export const BLACK: RGB = [0, 0, 0];
export const INK: RGB = [20, 19, 17];
export const PAPER: RGB = [251, 250, 247];
export const NIGHT: RGB = [15, 14, 12];
export const BLANK: RGB = [235, 232, 225];
const BAD: RGB = [179, 38, 30];
const AA = 4.5;

export const toHex = ([r, g, b]: readonly number[]) => `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`.toUpperCase();

const luminance = ([r, g, b]: readonly number[]) => {
  const c = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
/** WCAG contrast ratio between two colors. */
export const contrast = (a: readonly number[], b: readonly number[]) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

export const paletteCss = (colors: readonly Cluster[]) => `:root {\n${colors.map((c, i) => `  --brand-${i + 1}: ${toHex(c.rgb)};`).join('\n')}\n}`;

export const rgbOf = (c: Cluster): RGB => [Math.round(c.rgb[0]), Math.round(c.rgb[1]), Math.round(c.rgb[2])];

const pass = (ink: readonly number[], on: readonly number[]) => contrast(ink, on) >= AA;
// White if it passes, then the near-black ink, then pure black, which always passes where white fails.
export const inkOn = (rgb: RGB): RGB => (pass(WHITE, rgb) ? WHITE : pass(INK, rgb) ? INK : BLACK);
/** One ink that passes on every color in the list, or null when no single ink can. */
export const inkOverAll = (list: readonly RGB[]): RGB | null => [WHITE, INK, BLACK].find((ink) => list.every((c) => pass(ink, c))) ?? null;

const mix = (a: RGB, b: RGB, t: number): RGB => [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)];
const chroma = ([r, g, b]: RGB) => Math.max(r, g, b) - Math.min(r, g, b);

function accentOf(list: readonly Cluster[]): Cluster {
  const usable = list.filter((c) => c.share >= 0.04);
  return (usable.length ? usable : list).reduce((best, c) => (chroma(rgbOf(c)) > chroma(rgbOf(best)) ? c : best));
}

/** The custom properties the whole page is inked from. The same values on the server for the sample and in the browser for an upload. */
export function themeVars(list: readonly Cluster[]): Record<string, string> {
  const vars: Record<string, string> = {};
  for (let i = 0; i < 6; i++) {
    const rgb = list[i] ? rgbOf(list[i]) : BLANK;
    vars[`--p${i + 1}`] = toHex(rgb);
    vars[`--p${i + 1}-ink`] = toHex(inkOn(rgb));
  }
  const accent = list.length ? rgbOf(accentOf(list)) : ([242, 165, 22] as RGB);
  vars['--accent-from-image'] = toHex(accent);
  vars['--accent-ink'] = toHex(inkOn(accent));
  // The panel is paper leaning a little towards the image's lightest color.
  const lightest = list.length ? list.map(rgbOf).reduce((a, b) => (contrast(b, BLACK) > contrast(a, BLACK) ? b : a)) : PAPER;
  const panel = mix(PAPER, lightest, 0.16);
  vars['--panel'] = toHex(panel);
  vars['--panel-ink'] = toHex(inkOn(panel));
  vars['--panel-err'] = toHex(pass(BAD, panel) ? BAD : inkOn(panel));
  return vars;
}

const verdict = (ratio: number) => ({ ok: ratio >= AA, word: ratio >= AA ? 'AA' : 'fails', ratio: `${ratio.toFixed(1)}:1` });

/** Everything one color shows as text. */
export function swatch(c: Cluster) {
  return { hex: toHex(c.rgb), pct: `${Math.round(c.share * 100)}%`, white: verdict(contrast(c.rgb, WHITE)), black: verdict(contrast(c.rgb, BLACK)) };
}

/** The film sits on whichever ground lets its own color show. */
export const filmGround = (rgb: RGB) => toHex(contrast(rgb, PAPER) >= contrast(rgb, NIGHT) ? PAPER : NIGHT);
