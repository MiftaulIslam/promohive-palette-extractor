import type { Cluster, RGB } from './logic.ts';

export function kmeans(px: RGB[], k = 6): Cluster[] {
  // deterministic start: spread seeds over pixels sorted by brightness
  const sorted = [...px].sort((a, b) => (a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2]));
  let cents: RGB[] = Array.from({ length: k }, (_, i) => [...sorted[Math.floor(((i + 0.5) / k) * sorted.length)]] as RGB);
  const assign = new Array<number>(px.length).fill(0);
  for (let it = 0; it < 10; it++) {
    px.forEach((p, i) => {
      let best = 0, bd = Infinity;
      cents.forEach((c, j) => { const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2; if (d < bd) { bd = d; best = j; } });
      assign[i] = best;
    });
    const sums = cents.map(() => [0, 0, 0, 0]);
    px.forEach((p, i) => { const s = sums[assign[i]]; s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; s[3] += 1; });
    cents = sums.map((s, j): RGB => (s[3] ? [s[0] / s[3], s[1] / s[3], s[2] / s[3]] : cents[j]));
  }
  const counts = cents.map((_, j) => assign.filter((a) => a === j).length);
  return cents.map((c, j) => ({ rgb: c, share: counts[j] / px.length })).filter((c) => c.share > 0).sort((a, b) => b.share - a.share);
}
