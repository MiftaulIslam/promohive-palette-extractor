'use client';

/** True when the visitor asked for less motion. Read at the moment of use: only call it from an event or an effect. */
export const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Writes to the clipboard and says whether it worked, so callers never report a copy that did not happen. */
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export const COPY_FAILED = 'Copy failed, select the text instead';

const copyTimers = new WeakMap<Element, number>();

export function resetCopy(btn: Element) {
  clearTimeout(copyTimers.get(btn));
  (btn.querySelector('.copy__t') as HTMLElement).textContent = 'Copy';
  (btn.querySelector('.copy__hex') as HTMLElement).hidden = false;
}

/** The per-color copy button: says what happened, then settles back. */
export async function copySwatch(btn: HTMLElement) {
  const note = document.getElementById('pal-note') as HTMLElement;
  const ok = await copyText(btn.dataset.hex ?? '');
  resetCopy(btn);
  (btn.querySelector('.copy__t') as HTMLElement).textContent = ok ? 'Copied' : 'Copy failed';
  (btn.querySelector('.copy__hex') as HTMLElement).hidden = true;
  note.hidden = ok;
  note.textContent = ok ? '' : COPY_FAILED;
  copyTimers.set(btn, window.setTimeout(() => { resetCopy(btn); note.hidden = true; }, 1800));
}
