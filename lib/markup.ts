// HTML strings shared by the server render and the in-browser update, so the two can never drift apart.
// Only hex codes and numbers are interpolated, never file names or other visitor text.
import { filmGround, rgbOf, swatch, toHex, type Cluster } from './logic.ts';

const verdictHtml = (v: { ok: boolean; word: string; ratio: string }) => `<b class="${v.ok ? 'is-ok' : 'is-no'}">${v.word}</b> ${v.ratio}`;

export function chipHtml(c: Cluster, i: number, total: number) {
  const s = swatch(c);
  return `<li class="chip" style="--c:var(--p${i + 1});--ci:var(--p${i + 1}-ink)">`
    + `<div class="chip__face"><span class="chip__hole" aria-hidden="true"></span><span class="chip__share">${s.pct}</span><span class="chip__of">of the image</span></div>`
    + `<div class="chip__tag"><p class="chip__hex">${s.hex}</p><p class="chip__lbl">Color ${i + 1} of ${total}</p>`
    + `<dl class="chip__aa"><div><dt>White<span class="aa__t"> text</span></dt><dd>${verdictHtml(s.white)}</dd></div>`
    + `<div><dt>Black<span class="aa__t"> text</span></dt><dd>${verdictHtml(s.black)}</dd></div></dl></div></li>`;
}

export const cssHtml = (list: readonly Cluster[]) => `<span class="ln">:root {</span>${list.map((c, i) => `<span class="ln"><span class="swt" style="background:var(--p${i + 1})" aria-hidden="true"></span>--brand-${i + 1}: <span class="val">${toHex(c.rgb)}</span>;</span>`).join('')}<span class="ln">}</span>`;

export function filmHtml(c: Cluster, w: number, h: number) {
  const hex = toHex(c.rgb);
  return `<li class="film"><div class="film__plate" style="--plate:${filmGround(rgbOf(c))}"><canvas role="img" aria-label="The pixels grouped into ${hex}" width="${w}" height="${h}"></canvas></div><p class="film__hex">${hex}</p></li>`;
}
