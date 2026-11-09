import type { Cluster } from './logic.ts';

// Produced by scripts/derive-sample.mjs: assets/palette.webp read through a headless Chrome canvas
// at 128 x 160 (the 160px longest side the tool reads at), then lib/kmeans.ts with k = 6. Rerun it if the file changes.
export const SAMPLE_COLORS: readonly Cluster[] = [
  { rgb: [207.38, 211.47, 215.31], share: 0.2161 },
  { rgb: [26.69, 28.37, 33.31], share: 0.1998 },
  { rgb: [101.09, 113.9, 127.15], share: 0.1833 },
  { rgb: [63.67, 80.91, 47.26], share: 0.1613 },
  { rgb: [160.57, 170.26, 174.53], share: 0.1532 },
  { rgb: [187.56, 129.49, 58.8], share: 0.0865 },
];

export const SAMPLE_READ = { w: 128, h: 160 } as const;
