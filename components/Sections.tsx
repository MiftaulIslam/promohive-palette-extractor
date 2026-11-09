import Image from 'next/image';
import sample from '@/assets/palette.webp';
import swatches from '@/assets/photos/swatches.jpg';
import watercolor from '@/assets/photos/watercolor.jpg';
import paintpots from '@/assets/photos/paintpots.jpg';
import { paletteCss } from '@/lib/logic';
import { chipHtml, cssHtml, filmHtml } from '@/lib/markup';
import { SAMPLE_COLORS, SAMPLE_READ } from '@/lib/sample';

const chips = SAMPLE_COLORS.map((c, i) => chipHtml(c, i, SAMPLE_COLORS.length)).join('');
const films = SAMPLE_COLORS.map((c) => filmHtml(c, SAMPLE_READ.w, SAMPLE_READ.h)).join('');

export function SwatchWall() {
  return <figure className="ph-strip" aria-hidden="true"><Image className="ph-bg" src={swatches} alt="" fill sizes="100vw" placeholder="blur" /></figure>;
}

export function Rack() {
  return (
    <section className="rack below" aria-labelledby="rack-h">
      <div className="wrap">
        <div className="rack__head" data-in>
          <h2 id="rack-h">Which text reads on which color</h2>
          <div className="rack__side">
            <p>Every color shows whether white or black text on it passes WCAG AA, so you can see which text color reads.</p>
            <p><strong>Designers starting a brand kit</strong> pull starting colors from a client&apos;s logo or product shots.</p>
          </div>
        </div>
        <div className="rack__sheet" data-in>
          <span className="crop crop--tl" aria-hidden="true" /><span className="crop crop--tr" aria-hidden="true" />
          <span className="crop crop--bl" aria-hidden="true" /><span className="crop crop--br" aria-hidden="true" />
          <ul className="chips" id="pal-chips" dangerouslySetInnerHTML={{ __html: chips }} />
          <p className="rack__empty" id="pal-chips-empty" hidden>Six main colors appear here once an image is loaded.</p>
        </div>
      </div>
    </section>
  );
}

export function Plate() {
  return (
    <section className="plate below" aria-labelledby="plate-h">
      <div className="wrap plate__grid">
        <div className="plate__words" data-in>
          <h2 id="plate-h">Six lines for your stylesheet</h2>
          <p>Each swatch has its own copy button, and one more button copies all six as CSS variables.</p>
          <p className="plate__who"><strong>Developers setting up a theme</strong> turn a logo into CSS variables for a first theme, with the contrast already checked.</p>
          <figure className="plate__photo" aria-hidden="true"><Image className="ph-bg" src={watercolor} alt="" fill sizes="360px" placeholder="blur" /></figure>
        </div>
        <div className="plate__code" data-in style={{ '--i': 1 }}>
          <pre className="plate__pre" id="pal-css-block" tabIndex={0} aria-label="CSS variables for the current palette" dangerouslySetInnerHTML={{ __html: cssHtml(SAMPLE_COLORS) }} />
          <p className="plate__empty" id="pal-css-empty" hidden>Six main colors appear here once an image is loaded.</p>
          <button type="button" className="plate__copy" data-pal-css data-css={paletteCss(SAMPLE_COLORS)}><span>Copy as CSS variables</span></button>
        </div>
      </div>
    </section>
  );
}

export function Say() {
  return (
    <section className="say below has-photo" aria-labelledby="say-h">
      <Image className="ph-bg" src={paintpots} alt="" fill sizes="100vw" placeholder="blur" />
      <div className="wrap">
        <h2 id="say-h" data-in>Many products start with a logo file and a few photos, and no written color codes</h2>
        <p className="say__after" data-in style={{ '--i': 1 }}>Picking colors by eye with an eyedropper gives a slightly different shade each time. Then someone sets white text on a pale yellow button, and nobody can read it.</p>
      </div>
    </section>
  );
}

export function Separations() {
  const { w, h } = SAMPLE_READ;
  return (
    <section className="sep below" aria-labelledby="sep-h">
      <div className="wrap">
        <div className="sep__head" data-in>
          <h2 id="sep-h">Your browser does the separating</h2>
          <p>Drop in an image and your browser reads it on your device, samples the pixels and groups them into six main colors. The image is never uploaded.</p>
        </div>

        <div className="sep__press" data-in>
          <figure className="sep__stage sep__stage--a">
            <div className="sep__frame"><Image id="sep-src" src={sample} alt="The image you chose" sizes="(max-width: 1000px) 100vw, (min-width: 1440px) 540px, 40vw" /></div>
            <figcaption><span className="sep__n">1</span><b>Drop an image</b> Drag in a logo, product photo or mood board, or pick one from your files.</figcaption>
          </figure>
          <figure className="sep__stage sep__stage--b">
            <div className="sep__frame"><canvas id="sep-read" width={w} height={h} role="img" aria-label="The image as the browser read it, reduced to a small grid of pixels" /></div>
            <figcaption><span className="sep__n">2</span><b>Let it sample</b> <span id="sep-read-size">Read at {w} × {h} pixels</span>, so your browser samples the pixels and groups them into six colors.</figcaption>
          </figure>
          <figure className="sep__stage sep__stage--c">
            <div className="sep__frame"><canvas id="sep-poster" width={w} height={h} role="img" aria-label="The same image with every pixel replaced by its nearest main color" /></div>
            <figcaption><b>Grouped into six</b> Similar shades are grouped, and each pixel here is drawn in the main color nearest to it.</figcaption>
          </figure>
        </div>

        <div className="sep__films" data-in>
          <ul className="films" id="sep-films" dangerouslySetInnerHTML={{ __html: films }} />
          <p className="sep__filmnote">Every pixel, sorted into the color it belongs to</p>
        </div>

        <div className="sep__end" data-in>
          <div className="sep__moves">
            <div className="sep__copy">
              <p className="sep__n sep__n--big">3</p>
              <div>
                <h3>Check contrast</h3>
                <p>See whether white or black text passes WCAG AA on each swatch.</p>
              </div>
            </div>
            <div className="sep__copy">
              <p className="sep__n sep__n--big">4</p>
              <div>
                <h3>Copy the colors</h3>
                <p>Copy single hex codes or the full set as CSS variables.</p>
              </div>
            </div>
          </div>
          <dl className="ticket" aria-label="What the tool takes and gives">
            <div><dt>Input</dt><dd>One image, dropped in or picked from your device</dd></div>
            <div><dt>Outputs</dt><dd>Six swatches with hex codes, a WCAG AA result for white and black text on each, and CSS variables to copy</dd></div>
            <div><dt>Runs in</dt><dd>Your browser. The image is read locally and never uploaded.</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}
