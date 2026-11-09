import { filmHtml } from '@/lib/markup';
import { rgbOf, type Cluster } from '@/lib/logic';
import { SAMPLE_COLORS } from '@/lib/sample';

const MAX_SIDE = 160;

export interface Read { w: number; h: number; d: Uint8ClampedArray }

export function readPixels(im: HTMLImageElement): Read {
  // An SVG without a width or height reports 0, so it is drawn at 160 x 160.
  const nw = im.naturalWidth || MAX_SIDE, nh = im.naturalHeight || MAX_SIDE;
  const scale = Math.min(1, MAX_SIDE / Math.max(nw, nh));
  const w = Math.max(1, Math.round(nw * scale)), h = Math.max(1, Math.round(nh * scale));
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('no 2d context');
  ctx.drawImage(im, 0, 0, w, h);
  return { w, h, d: ctx.getImageData(0, 0, w, h).data };
}

const readCv = document.getElementById('sep-read') as HTMLCanvasElement;
const posterCv = document.getElementById('sep-poster') as HTMLCanvasElement;
const readSize = document.getElementById('sep-read-size') as HTMLElement;
const filmsEl = document.getElementById('sep-films') as HTMLElement;

const ctx2d = (cv: HTMLCanvasElement) => cv.getContext('2d') as CanvasRenderingContext2D;

function paint(read: Read | null, list: readonly Cluster[]) {
  filmsEl.replaceChildren();
  if (!read || !list.length) {
    [readCv, posterCv].forEach((cv) => { cv.width = 4; cv.height = 5; ctx2d(cv).clearRect(0, 0, 4, 5); });
    readSize.textContent = 'Read at a small size';
    return;
  }
  const { w, h, d } = read;
  readCv.width = w; readCv.height = h;
  ctx2d(readCv).putImageData(new ImageData(new Uint8ClampedArray(d), w, h), 0, 0);
  readSize.textContent = `Read at ${w} × ${h} pixels`;
  const cents = list.map(rgbOf);
  const assign = new Int8Array(w * h).fill(-1);
  for (let i = 0; i < w * h; i++) {
    const o = i * 4;
    if (d[o + 3] <= 125) continue;
    let best = 0, bd = Infinity;
    cents.forEach((c, j) => { const dist = (d[o] - c[0]) ** 2 + (d[o + 1] - c[1]) ** 2 + (d[o + 2] - c[2]) ** 2; if (dist < bd) { bd = dist; best = j; } });
    assign[i] = best;
  }
  const draw = (cv: HTMLCanvasElement, pick: (a: number) => readonly number[] | null) => {
    cv.width = w; cv.height = h;
    const c2 = ctx2d(cv), im = c2.createImageData(w, h);
    for (let i = 0; i < w * h; i++) {
      const c = pick(assign[i]);
      if (!c) continue;
      const o = i * 4;
      im.data[o] = c[0]; im.data[o + 1] = c[1]; im.data[o + 2] = c[2]; im.data[o + 3] = 255;
    }
    c2.putImageData(im, 0, 0);
  };
  draw(posterCv, (a) => (a < 0 ? null : cents[a]));
  filmsEl.innerHTML = list.map((c) => filmHtml(c, w, h)).join('');
  filmsEl.querySelectorAll('canvas').forEach((cv, j) => draw(cv, (a) => (a === j ? cents[j] : null)));
}

// Nothing is painted until the section has scrolled near the viewport; until then only the latest result is kept.
let near = false;
let latest: { read: Read | null; list: readonly Cluster[] } | null = null;

export function updateSeparations(read: Read | null, list: readonly Cluster[]) {
  latest = { read, list };
  if (near) paint(read, list);
}

export function revealSeparations(sampleSrc: string) {
  near = true;
  if (latest) { paint(latest.read, latest.list); return; }
  const im = new Image();
  im.onload = () => {
    if (latest) return;
    try {
      paint(readPixels(im), SAMPLE_COLORS);
    } catch { /* the canvases stay blank at their reserved size */ }
  };
  im.src = sampleSrc;
}
