import './page.css';
import type { Viewport } from 'next';
import { FAQ, Guide } from '@/components/Guide';
import { Press } from '@/components/Press';
import { PressController } from '@/components/PressController';
import { Plate, Rack, Say, Separations, SwatchWall } from '@/components/Sections';
import { ToolFoot, ToolJsonLd } from '@/components/Shell';
import sample from '@/assets/palette.webp';
import { inkOverAll, rgbOf, themeVars, toHex } from '@/lib/logic';
import { SAMPLE_COLORS } from '@/lib/sample';

// The browser bar takes the sample's largest color, which the first screen is printed in. tool.themeColor is for the manifest.
export const viewport: Viewport = { themeColor: toHex(SAMPLE_COLORS[0].rgb), colorScheme: 'light' };

const sampleBrandInk = (i: number) => toHex(inkOverAll([rgbOf(SAMPLE_COLORS[i])]) ?? [20, 19, 17]);

const sampleRoot = `:root{${Object.entries({
  ...themeVars(SAMPLE_COLORS),
  '--bar-brand': 'var(--panel-ink)',
  '--bar-nav': 'var(--panel-ink)',
  '--bar-nav-on': 'var(--panel)',
  '--sample-brand-first': sampleBrandInk(0),
  '--sample-brand-second': sampleBrandInk(1),
}).map(([k, v]) => `${k}:${v}`).join(';')}}`;

export default function Page() {
  return (
    <>
      <style>{sampleRoot}</style>
      <Press />
      <main>
        <Rack />
        <SwatchWall />
        <Plate />
        <Say />
        <Separations />
        <Guide />
      </main>
      <ToolFoot className="ph-foot below" />
      <PressController sampleSrc={sample.src} />
      <ToolJsonLd faq={FAQ} />
    </>
  );
}
