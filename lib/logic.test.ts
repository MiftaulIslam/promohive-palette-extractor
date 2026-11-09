import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contrast, filmGround, inkOn, inkOverAll, paletteCss, rgbOf, swatch, themeVars, toHex, type RGB } from './logic.ts';
import { kmeans } from './kmeans.ts';
import { SAMPLE_COLORS } from './sample.ts';

const WHITE: RGB = [255, 255, 255];
const BLACK: RGB = [0, 0, 0];

test('toHex rounds and upper-cases', () => {
  assert.equal(toHex([207.38, 211.47, 215.31]), '#CFD3D7');
  assert.equal(toHex([0, 0, 15.6]), '#000010');
});

test('contrast is symmetric and spans 1 to 21', () => {
  assert.equal(contrast(WHITE, BLACK), 21);
  assert.equal(contrast(BLACK, WHITE), 21);
  assert.equal(contrast([100, 100, 100], [100, 100, 100]), 1);
});

test('kmeans groups pixels and sorts by share', () => {
  const red: RGB = [200, 20, 20], blue: RGB = [20, 20, 200];
  const px: RGB[] = [...Array<RGB>(30).fill(red), ...Array<RGB>(10).fill(blue)];
  const out = kmeans(px, 2);
  assert.deepEqual(out.map((c) => toHex(c.rgb)), [toHex(red), toHex(blue)]);
  assert.deepEqual(out.map((c) => c.share), [0.75, 0.25]);
});

test('kmeans drops clusters nothing was assigned to', () => {
  const px = Array<RGB>(12).fill([9, 9, 9]);
  const out = kmeans(px, 6);
  assert.equal(out.length, 1);
  assert.equal(out[0].share, 1);
});

test('paletteCss writes one variable per color', () => {
  assert.equal(paletteCss(SAMPLE_COLORS.slice(0, 2)), ':root {\n  --brand-1: #CFD3D7;\n  --brand-2: #1B1C21;\n}');
});

test('inkOn prefers white, then near-black, then black', () => {
  assert.deepEqual(inkOn([27, 28, 33]), WHITE);
  assert.deepEqual(inkOn([207, 211, 215]), [20, 19, 17]);
});

test('inkOverAll finds a shared ink or none', () => {
  assert.deepEqual(inkOverAll([[27, 28, 33], [101, 114, 127]]), WHITE);
  assert.equal(inkOverAll([[207, 211, 215], [27, 28, 33]]), null);
});

test('swatch reports the shares and contrast the sample shows', () => {
  const s = swatch(SAMPLE_COLORS[2]);
  assert.equal(s.hex, '#65727F');
  assert.equal(s.pct, '18%');
  assert.deepEqual(s.white, { ok: true, word: 'AA', ratio: '4.9:1' });
  assert.deepEqual(s.black, { ok: false, word: 'fails', ratio: '4.3:1' });
});

test('themeVars inks the page from the sample as the design did', () => {
  const v = themeVars(SAMPLE_COLORS);
  assert.equal(v['--p1'], '#CFD3D7');
  assert.equal(v['--p1-ink'], '#141311');
  assert.equal(v['--accent-from-image'], '#BC813B');
  assert.equal(v['--accent-ink'], '#141311');
  assert.equal(v['--panel'], '#F4F4F2');
  assert.equal(v['--panel-err'], '#B3261E');
});

test('themeVars blanks every field for an empty palette', () => {
  const v = themeVars([]);
  assert.equal(v['--p6'], '#EBE8E1');
  assert.equal(v['--accent-from-image'], '#F2A516');
});

test('filmGround picks the ground the color shows on', () => {
  assert.equal(filmGround(rgbOf(SAMPLE_COLORS[0])), '#0F0E0C');
  assert.equal(filmGround(rgbOf(SAMPLE_COLORS[1])), '#FBFAF7');
});
