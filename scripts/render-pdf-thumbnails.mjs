#!/usr/bin/env node
/**
 * One-time PDF thumbnail renderer: renders page 1 of each certificate PDF
 * into public/images/certificate/thumbs/<name>.webp
 * Usage: node scripts/render-pdf-thumbnails.mjs
 */
import { readdir, mkdir, stat, readFile } from "node:fs/promises";
import { join, basename } from "node:path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import sharp from "sharp";

const CERT_DIR = new URL("../public/images/certificate", import.meta.url).pathname;
const THUMB_DIR = join(CERT_DIR, "thumbs");
const STANDARD_FONTS = new URL("../node_modules/pdfjs-dist/standard_fonts/", import.meta.url).pathname;

async function renderThumb(pdfPath, outPath) {
  const data = new Uint8Array(await readFile(pdfPath));
  const doc = await getDocument({
    data,
    standardFontDataUrl: STANDARD_FONTS,
  }).promise;

  const page = await doc.getPage(1);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = 800 / baseViewport.width;
  const viewport = page.getViewport({ scale });

  const canvasFactory = doc.canvasFactory;
  const { canvas, context } = canvasFactory.create(viewport.width, viewport.height);
  await page.render({ canvasContext: context, viewport }).promise;

  await sharp(canvas.toBuffer("image/png")).webp({ quality: 82 }).toFile(outPath);
  await doc.destroy();
}

const files = (await readdir(CERT_DIR)).filter((f) => f.toLowerCase().endsWith(".pdf"));
await mkdir(THUMB_DIR, { recursive: true });

for (const file of files) {
  const pdfPath = join(CERT_DIR, file);
  const outPath = join(THUMB_DIR, basename(file, ".pdf") + ".webp");
  const before = (await stat(pdfPath)).size;
  try {
    await renderThumb(pdfPath, outPath);
    const after = (await stat(outPath)).size;
    console.log(`${file}: PDF ${(before / 1024).toFixed(0)} KB → thumb ${(after / 1024).toFixed(1)} KB`);
  } catch (err) {
    console.error(`FAILED ${file}:`, err.stack?.split("\n")[0] ?? err.message);
  }
}
console.log("Done.");
