import { readPixels } from './separations';
import { fail, land, setStatus } from './press-view';
import { kmeans } from '@/lib/kmeans';
import type { RGB } from '@/lib/logic';

const MAX_BYTES = 15 * 1024 * 1024;

// Bumped on every pick, so a slower earlier image cannot overwrite a newer one.
let pickId = 0;

export function analyze(src: string) {
  const id = ++pickId;
  setStatus({ loading: true });
  const im = new Image();
  im.onload = () => {
    if (id !== pickId) return;
    try {
      const read = readPixels(im), { d } = read;
      const px: RGB[] = [];
      for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 125) px.push([d[i], d[i + 1], d[i + 2]]);
      if (px.length < 6) { fail('The image looks fully transparent. Try one with visible colors.'); return; }
      land(kmeans(px, 6), src, read);
    } catch { fail('This browser blocked reading that image. Open the site from a web address (not a local file) or choose your own image.'); }
  };
  im.onerror = () => { if (id === pickId) fail('That file could not be read as an image. Try a JPG, PNG, WebP or SVG.'); };
  im.src = src;
}

export function take(f: File) {
  const id = ++pickId;
  if (!f.type.startsWith('image/')) { fail('That file is not an image. Choose a JPG, PNG, WebP or SVG.'); return; }
  if (f.size > MAX_BYTES) { fail('That image is over 15 MB. Try a smaller copy.'); return; }
  const r = new FileReader();
  r.onload = () => { if (id === pickId && typeof r.result === 'string') analyze(r.result); };
  r.onerror = () => { if (id === pickId) fail('That file could not be opened.'); };
  r.readAsDataURL(f);
}
