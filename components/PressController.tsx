'use client';

import { useEffect } from 'react';
import { COPY_FAILED, copySwatch, copyText } from './client';

const CUE_IDLE = 'Or drop one anywhere on this screen', CUE_OVER = 'Let go to read its colors';
const CSS_LABEL = 'Copy as CSS variables';

const element = <T extends Element = HTMLElement>(s: string) => document.querySelector(s) as T;

/** Renders nothing: the first screen is server HTML, and this only attaches behaviour to it. */
export function PressController({ sampleSrc }: { sampleSrc: string }) {
  useEffect(() => {
    const press = element('#press'), input = element<HTMLInputElement>('#pal-file'), cue = element('[data-cue]');
    const loadingEl = element('#pal-loading'), errorEl = element('#pal-error');
    const cssBtn = element<HTMLButtonElement>('[data-pal-css]'), cssLabel = cssBtn.querySelector('span') as HTMLElement;
    const live = new AbortController(), on = { signal: live.signal };

    const reader = () => import('./press-read');
    // Each action claims a ticket before its code is fetched, so a slower download cannot run over a newer pick.
    let ticket = 0;
    const act = <T,>(load: Promise<T>, job: (mod: T) => void, busy = true) => {
      const mine = ++ticket;
      if (busy) { errorEl.hidden = true; loadingEl.hidden = false; press.setAttribute('aria-busy', 'true'); }
      load.then((mod) => { if (mine === ticket) job(mod); }, () => {
        if (mine !== ticket) return;
        loadingEl.hidden = true;
        press.setAttribute('aria-busy', 'false');
        errorEl.textContent = 'The tool could not load. Check your connection and try again.';
        errorEl.hidden = false;
      });
    };
    const pick = (f: File | undefined) => { if (f) act(reader(), (r) => r.take(f)); };

    input.addEventListener('change', () => {
      pick(input.files?.[0]);
      // Cleared so the same file can be chosen again after trying a sample.
      input.value = '';
    }, on);
    // A file chosen in the moment before this ran has already fired its change event.
    if (input.files?.length) { pick(input.files[0]); input.value = ''; }

    element('[data-pal-sample]').addEventListener('click', () => act(reader(), (r) => r.analyze(sampleSrc)), on);
    element('[data-pal-poster]').addEventListener('click', () => act(Promise.all([reader(), import('./poster')]), ([r, p]) => r.analyze(p.drawPoster())), on);
    element('[data-pal-reset]').addEventListener('click', () => act(import('./press-view'), (v) => v.reset(), false), on);

    // Dropping anywhere on the first screen; elsewhere a stray drop must not navigate away from the page.
    const over = (is: boolean) => { press.classList.toggle('is-over', is); cue.textContent = is ? CUE_OVER : CUE_IDLE; };
    press.addEventListener('dragenter', (e) => { e.preventDefault(); over(true); }, on);
    press.addEventListener('dragover', (e) => { e.preventDefault(); over(true); }, on);
    press.addEventListener('dragleave', (e) => { e.preventDefault(); if (!press.contains(e.relatedTarget as Node | null)) over(false); }, on);
    press.addEventListener('drop', (e) => { e.preventDefault(); over(false); pick(e.dataTransfer?.files[0]); }, on);
    document.addEventListener('dragover', (e) => e.preventDefault(), on);
    document.addEventListener('drop', (e) => e.preventDefault(), on);

    press.addEventListener('click', (e) => {
      const btn = (e.target as Element).closest<HTMLElement>('.copy[data-hex]');
      if (btn) void copySwatch(btn);
    }, on);

    let cssTimer = 0;
    cssBtn.addEventListener('click', async () => {
      const ok = await copyText(cssBtn.dataset.css ?? '');
      cssLabel.textContent = ok ? 'CSS copied' : COPY_FAILED;
      clearTimeout(cssTimer);
      cssTimer = window.setTimeout(() => { cssLabel.textContent = CSS_LABEL; }, 1800);
    }, on);

    const sep = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      sep.disconnect();
      // On failure the film strip keeps its reserved, blank frames.
      import('./separations').then((m) => m.revealSeparations(sampleSrc), () => {});
    }, { rootMargin: '800px 0px' });
    sep.observe(element('.sep'));

    return () => { live.abort(); sep.disconnect(); clearTimeout(cssTimer); };
  }, [sampleSrc]);

  return null;
}
