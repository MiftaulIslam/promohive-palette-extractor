import type { Faq } from './Shell';
import { company, links, service } from '@/lib/site';

/** Shown on the page and in the FAQPage structured data, so the two always match. Behaviour follows lib/kmeans.ts and lib/logic.ts. */
export const FAQ: readonly Faq[] = [
  {
    q: 'How does the palette extractor pick the six colors?',
    a: 'Your browser scales the image down so its longer side is at most 160 pixels, skips transparent pixels, and groups the rest into six clusters with k-means. Each swatch is the average color of one cluster, sorted by how much of the image it covers. The starting points are fixed, so the same image always gives the same palette.',
  },
  {
    q: 'What does the contrast check on each swatch mean?',
    a: 'Each swatch shows the WCAG contrast ratio of white text and of black text on that color, and whether each reaches 4.5:1, the AA level for normal-size text. Use the one marked AA for buttons and labels set on that color. A pale yellow, for example, usually passes with black text and fails with white.',
  },
  {
    q: 'Which image files can I use?',
    a: 'Any image your browser can open, such as JPG, PNG, WebP or SVG, up to 15 MB. Logos, product photos, screenshots and mood boards all work. Choose a file or drop it anywhere on the first screen. A fully transparent image has no colors to read, so the tool asks for a different one.',
  },
  {
    q: 'Is my image uploaded to a server?',
    a: `No. The file is read by your browser on your own device, which samples the pixels and works out the palette locally. Nothing is uploaded, stored or sent anywhere, so it is safe to use with unreleased logos and client work. The tool is free, needs no sign-up, and is published by ${company.name}.`,
  },
  {
    q: 'How do I use the colors in my CSS?',
    a: 'Each swatch has a button that copies its hex code, and one more button copies all six as CSS custom properties named --brand-1 to --brand-6, ordered from the largest share of the image to the smallest. Paste them into the :root rule of your stylesheet and use them anywhere with var(--brand-1).',
  },
];

export function Guide() {
  return (
    <section className="ph-guide below" aria-labelledby="guide-h">
      <div className="wrap ph-guide__grid">
        <div>
          <h2 id="guide-h">How to pull a palette from an image</h2>
          <ol className="ph-steps">
            <li><p>Choose an image, or drop a logo, product photo or mood board anywhere on the first screen.</p></li>
            <li><p>Wait a moment while your browser reads it and groups its pixels into six main colors.</p></li>
            <li><p>Check each swatch’s share of the image, and whether white or black text on it passes WCAG AA.</p></li>
            <li><p>Copy a single hex code, or copy all six as CSS variables for your stylesheet.</p></li>
          </ol>
        </div>

        <div>
          <h2 id="faq-h">Palette questions</h2>
          <div className="ph-faq">
            {FAQ.map((f) => (
              <div key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="ph-guide__more">
          This extractor is published by <a href={links.home}>{company.name}</a>, which also does <a href={service('product-design')}>product and brand design</a>, <a href={service('web-development')}>website development</a> and <a href={service('saas-development')}>SaaS product development</a>, from the first color palette to the shipped interface.
        </p>
      </div>
    </section>
  );
}
