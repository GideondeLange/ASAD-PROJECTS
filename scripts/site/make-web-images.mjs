// Makes web-sized (max 1600px wide) copies of the big phone photos used by the
// gallery and services pages, so those pages are not 40 MB. Originals are untouched.
//   node scripts/site/make-web-images.mjs   (also runs as part of `npm run pages`)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { GALLERY } from './gallery.mjs';
import { SERVICES } from './services.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const srcDir = path.join(root, 'public/images/chosen');
const outDir = path.join(root, 'public/images/web');
fs.mkdirSync(outDir, { recursive: true });

const names = new Set([...GALLERY.map((g) => g.file), ...SERVICES.flatMap((s) => s.images), 'asad-pod5', 'asad-pod6'].filter((n) => !n.startsWith('/')));
let made = 0;
for (const n of names) {
  const src = path.join(srcDir, `${n}.jpg`);
  const out = path.join(outDir, `${n}.jpg`);
  if (!fs.existsSync(src)) { console.warn('missing', n); continue; }
  if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs) continue;
  await sharp(src).rotate().resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 80, mozjipeg: true }).toFile(out);
  made++;
}
console.log(`web images: ${made} made, ${names.size - made} up to date`);
