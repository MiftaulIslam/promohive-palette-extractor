import Image from 'next/image';
import { ToolBar } from './Shell';
import sample from '@/assets/palette.webp';
import { swatch, type Cluster } from '@/lib/logic';
import { SAMPLE_COLORS } from '@/lib/sample';

function Field({ c, slot }: { c: Cluster; slot: number }) {
  const s = swatch(c);
  return (
    <li className="field">
      <div className="sheet" style={{ '--c': `var(--p${slot})`, '--ci': `var(--p${slot}-ink)` }}>
        <div className="sheet__label">
          <p className="hex" data-v="hex">{s.hex}</p>
          <p className="share"><span className="share__n" data-v="share">{s.pct}</span> of the image</p>
          <span className="bar" aria-hidden="true"><i data-v="bar" style={{ transform: `scaleX(${c.share})` }} /></span>
          <dl className="aa">
            <div><dt>White<span className="aa__t"> text</span></dt><dd data-v="white"><b>{s.white.word}</b> {s.white.ratio}</dd></div>
            <div><dt>Black<span className="aa__t"> text</span></dt><dd data-v="black"><b>{s.black.word}</b> {s.black.ratio}</dd></div>
          </dl>
          <button className="copy" type="button" data-hex={s.hex}><span className="copy__t">Copy</span> <span className="copy__hex">{s.hex}</span></button>
        </div>
      </div>
    </li>
  );
}

export function Press() {
  return (
    <section className="press press--sample" id="press" aria-label="Brand Palette Extractor">
      <ol className="fields" id="pal-swatches" aria-label="Main colors, largest share first">
        {SAMPLE_COLORS.map((c, i) => <Field key={i} c={c} slot={i + 1} />)}
      </ol>

      <ToolBar />

      <div className="panel">
        <div className="panel__head">
          <h1>Six colors from any image</h1>
          <figure className="print" id="pal-preview">
            <Image id="pal-img" src={sample} alt="The image you chose" loading="eager" sizes="(max-width: 1000px) 56px, (min-width: 1467px) 160px, 11vw" />
            <figcaption>Your print</figcaption>
          </figure>
        </div>
        <p className="panel__intro">A free color palette extractor for designers and developers. It pulls six main colors from a logo or photo, with hex codes and a contrast check for each. No sign-up, and the image stays in your browser.</p>
        <div className="panel__do">
          <input id="pal-file" className="sr-only" type="file" accept="image/*" />
          <label className="choose" htmlFor="pal-file">Choose an image</label>
          <div className="panel__words">
            <p className="panel__cue" data-cue>Or drop one anywhere on this screen</p>
            <p className="panel__fine">Logo, product photo or mood board. It stays on your device.</p>
          </div>
        </div>
        <div className="panel__foot">
          <div className="panel__alt">
            <button type="button" className="alt" data-pal-sample>Try a sample photo</button>
            <button type="button" className="alt" data-pal-poster>Try a drawn poster</button>
            <button type="button" className="alt" data-pal-reset>Remove image</button>
          </div>
          <div className="status" aria-live="polite">
            <p id="pal-loading" hidden>Reading the image…</p>
            <p id="pal-error" className="status__err" hidden />
            <p id="pal-empty" hidden>Six main colors appear here once an image is loaded.</p>
            <p id="pal-note" hidden />
          </div>
        </div>
      </div>

      <p className="sr-only" id="pal-live" aria-live="polite" />
    </section>
  );
}
