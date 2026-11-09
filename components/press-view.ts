import { calm, resetCopy } from './client';
import { updateSeparations, type Read } from './separations';
import { chipHtml, cssHtml } from '@/lib/markup';
import { BLANK, INK, WHITE, inkOverAll, paletteCss, rgbOf, swatch, themeVars, toHex, type Cluster, type RGB } from '@/lib/logic';
import { SAMPLE_COLORS } from '@/lib/sample';

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T;
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];

const press = $('#press');
const fields = $$('#pal-swatches .field'), sheets = fields.map((li) => $('.sheet', li));
const preview = $('#pal-preview'), previewImg = $<HTMLImageElement>('#pal-img'), sepSrc = $<HTMLImageElement>('#sep-src');
const loadingEl = $('#pal-loading'), errorEl = $('#pal-error'), emptyEl = $('#pal-empty'), liveEl = $('#pal-live');
const resetBtn = $('[data-pal-reset]');
const cssBtn = $<HTMLButtonElement>('[data-pal-css]'), cssBlock = $('#pal-css-block'), cssEmpty = $('#pal-css-empty');
const chipsEl = $('#pal-chips'), chipsEmpty = $('#pal-chips-empty');
const brand = $('.press .ph-brand'), nav = $('.press .ph-nav');
const bands = matchMedia('(width <= 1000px)');

let colors: readonly Cluster[] = SAMPLE_COLORS;
let tracking = false;

// The header sits over whichever fields are under it at this width, so measure them.
function inkHeader() {
  const under = (el: HTMLElement) => {
    const a = el.getBoundingClientRect();
    return fields.flatMap((li, i): RGB[] => {
      const b = li.getBoundingClientRect();
      if (!(b.left < a.right && b.right > a.left && b.top < a.bottom && b.bottom > a.top)) return [];
      return [colors[i] ? rgbOf(colors[i]) : BLANK];
    });
  };
  const st = document.documentElement.style;
  const apply = (el: HTMLElement, prop: string, partnerProp?: string) => {
    const ink = el === nav ? null : inkOverAll(under(el)); // the nav spans a seam between fields, so it always sits on the plate
    el.classList.toggle('has-plate', !ink);
    if (ink) {
      st.setProperty(prop, toHex(ink));
      if (partnerProp) st.setProperty(partnerProp, toHex(ink === WHITE ? INK : WHITE));
      el.style.setProperty('--focus', toHex(ink));
    } else {
      st.setProperty(prop, 'var(--panel-ink)');
      if (partnerProp) st.setProperty(partnerProp, 'var(--panel)');
      el.style.setProperty('--focus', 'var(--panel-ink)');
    }
  };
  apply(brand, '--bar-brand');
  apply(nav, '--bar-nav', '--bar-nav-on');
}

function setRoot(list: readonly Cluster[]) {
  const st = document.documentElement.style;
  for (const [name, value] of Object.entries(themeVars(list))) st.setProperty(name, value);
}

function fillSheet(sheet: HTMLElement, c: Cluster | undefined, hasImage: boolean) {
  const slot = (k: string) => $(`[data-v="${k}"]`, sheet);
  const copy = $('.copy', sheet);
  resetCopy(copy);
  if (!c) {
    sheet.classList.add('is-blank');
    sheet.parentElement?.setAttribute('aria-hidden', 'true');
    slot('hex').textContent = hasImage ? 'No color here' : 'No color yet';
    copy.removeAttribute('data-hex');
    return;
  }
  const s = swatch(c);
  sheet.classList.remove('is-blank');
  sheet.parentElement?.removeAttribute('aria-hidden');
  slot('hex').textContent = s.hex;
  slot('share').textContent = s.pct;
  slot('bar').style.transform = `scaleX(${c.share})`;
  slot('white').innerHTML = `<b>${s.white.word}</b> ${s.white.ratio}`;
  slot('black').innerHTML = `<b>${s.black.word}</b> ${s.black.ratio}`;
  copy.dataset.hex = s.hex;
  $('.copy__hex', copy).textContent = s.hex;
}

const WIPE_MS = 340, WIPE_STAGGER = 60, WIPE_EASE = 'cubic-bezier(.16, 1, .3, 1)';
let wipeRun: { cancel(): void } | null = null;

// Each sheet is printed over the last one, left to right. The ghosts hold the old colors while the root variables change.
function wipe(update: () => void): Promise<void> {
  wipeRun?.cancel();
  if (calm()) { update(); return Promise.resolve(); }
  const ghosts = sheets.map((s) => {
    const g = s.cloneNode(true) as HTMLElement;
    const live = getComputedStyle(s);
    g.style.setProperty('--c', live.getPropertyValue('--c'));
    g.style.setProperty('--ci', live.getPropertyValue('--ci'));
    g.classList.add('sheet--ghost');
    g.setAttribute('aria-hidden', 'true');
    g.inert = true;
    $$('[data-hex]', g).forEach((n) => n.removeAttribute('data-hex'));
    s.before(g);
    return g;
  });
  update();
  const from = bands.matches ? 'inset(0 0 100% 0)' : 'inset(0 100% 0 0)';
  const anims = sheets.map((s, i) => s.animate({ clipPath: [from, 'inset(0 0 0 0)'] }, { duration: WIPE_MS, delay: i * WIPE_STAGGER, easing: WIPE_EASE, fill: 'backwards' }));
  let cancelled = false;
  wipeRun = { cancel() { cancelled = true; anims.forEach((a) => a.cancel()); ghosts.forEach((g) => g.remove()); wipeRun = null; } };
  return Promise.all(anims.map((a) => a.finished)).catch(() => {}).then(() => {
    if (cancelled) return;
    ghosts.forEach((g) => g.remove());
    wipeRun = null;
  });
}

function renderChips(list: readonly Cluster[]) {
  chipsEl.innerHTML = list.map((c, i) => chipHtml(c, i, list.length)).join('');
  chipsEmpty.hidden = list.length > 0;
}

function renderCss(list: readonly Cluster[]) {
  cssBtn.disabled = !list.length;
  cssBtn.dataset.css = list.length ? paletteCss(list) : '';
  cssEmpty.hidden = list.length > 0;
  cssBlock.hidden = !list.length;
  cssBlock.innerHTML = list.length ? cssHtml(list) : '';
}

export function setStatus({ loading = false, error = '' }: { loading?: boolean; error?: string }) {
  loadingEl.hidden = !loading;
  errorEl.hidden = !error;
  errorEl.textContent = error;
  emptyEl.hidden = colors.length > 0 || loading || !!error;
  press.setAttribute('aria-busy', String(loading));
}

// The last palette stays on the sheet, so what is showing is what "Copy as CSS" copies.
export function fail(text: string) {
  setStatus({ error: text });
}

function showImage(src: string | null) {
  [previewImg, sepSrc].forEach((img) => {
    img.removeAttribute('srcset');
    if (src) img.src = src; else img.removeAttribute('src');
  });
  $('.sep').classList.toggle('is-empty', !src);
  preview.hidden = !src;
  resetBtn.hidden = !src;
}

function startTracking() {
  if (tracking) return;
  tracking = true;
  let raf = 0;
  addEventListener('resize', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(inkHeader); });
  document.fonts.ready.then(inkHeader);
}

export function land(list: readonly Cluster[], src: string | null, read: Read | null) {
  colors = list;
  press.classList.remove('press--sample');
  setStatus({});
  showImage(src);
  wipe(() => {
    setRoot(list);
    sheets.forEach((s, i) => fillSheet(s, list[i], !!src));
  });
  inkHeader();
  startTracking();
  renderChips(list);
  renderCss(list);
  updateSeparations(read, list);
  liveEl.textContent = list.length ? `${list.length} main colors: ${list.map((c) => toHex(c.rgb)).join(', ')}` : 'Image removed.';
}

export function reset() {
  land([], null, null);
  setStatus({});
}
