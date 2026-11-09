// Regenerates SAMPLE_COLORS in lib/sample.ts: run with `node --experimental-strip-types scripts/derive-sample.mjs` and paste the output.
// The pixels come from headless Chrome because the numbers must match what a browser canvas reads from this file.
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { kmeans } from '../lib/kmeans.ts';

const MAX_SIDE = 160;
const base64 = readFileSync(new URL('../assets/palette.webp', import.meta.url)).toString('base64');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const port = 20000 + Math.floor(Math.random() * 20000);
const profile = mkdtempSync(join(tmpdir(), 'ph-sample-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', `--remote-debugging-port=${port}`, '--force-color-profile=srgb', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });

let ws;
for (let i = 0; i < 120 && !ws; i++) {
  try {
    const page = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page');
    if (page) ws = new WebSocket(page.webSocketDebuggerUrl);
  } catch { /* Chrome is still starting */ }
  if (!ws) await sleep(250);
}
await new Promise((r) => ws.addEventListener('open', r, { once: true }));

const reply = new Promise((resolve) => ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id === 1) resolve(m.result); }));
ws.send(JSON.stringify({
  id: 1,
  method: 'Runtime.evaluate',
  params: {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((ok, no) => {
      const im = new Image();
      im.onerror = no;
      im.onload = () => {
        const scale = Math.min(1, ${MAX_SIDE} / Math.max(im.naturalWidth, im.naturalHeight));
        const w = Math.max(1, Math.round(im.naturalWidth * scale)), h = Math.max(1, Math.round(im.naturalHeight * scale));
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        const ctx = cv.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(im, 0, 0, w, h);
        ok({ w, h, d: [...ctx.getImageData(0, 0, w, h).data] });
      };
      im.src = 'data:image/webp;base64,${base64}';
    })`,
  },
}));
const { result } = await reply;
ws.close();
chrome.kill();
await sleep(300);
try { rmSync(profile, { recursive: true, force: true }); } catch { /* Chrome may still hold the profile */ }

const { w, h, d } = result.value;
const px = [];
for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 125) px.push([d[i], d[i + 1], d[i + 2]]);
const round = (n, dp) => Number(n.toFixed(dp));
console.log(`// read at ${w} x ${h}`);
for (const c of kmeans(px, 6)) console.log(`  { rgb: [${c.rgb.map((v) => round(v, 2)).join(', ')}], share: ${round(c.share, 4)} },`);
