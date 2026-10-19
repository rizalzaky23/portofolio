#!/usr/bin/env node
/**
 * One-time image optimizer: resize + convert to WebP, then remove originals.
 * Usage: node scripts/optimize-images.mjs
 */
import { readdir, stat, unlink } from "node:fs/promises";
import { join, extname, basename } from "node:path";
import sharp from "sharp";

const ROOT = new URL("../public", import.meta.url).pathname;

/** maxOutputWidth, quality by path pattern */
const RULES = [
  { test: (p) => p.includes("/images/project/"), width: 1600, quality: 80 },
  { test: (p) => p.includes("/images/certificate/"), width: 1000, quality: 80 },
  { test: (p) => p.includes("/images/lomba/"), width: 1000, quality: 80 },
  { test: (p) => p.includes("/images/schools/"), width: 192, quality: 85 },
  { test: (p) => /service_.*\.jpe?g$/.test(p), width: 900, quality: 80 },
  { test: (p) => p.endsWith("profil.png"), width: 400, quality: 85 },
  { test: (p) => p.endsWith("logo.png"), width: 128, quality: 90, keepFormat: true },
];

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg"]);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

function fmt(bytes) {
  return (bytes / 1024).toFixed(1) + " KB";
}

let totalBefore = 0;
let totalAfter = 0;
let count = 0;

for await (const file of walk(ROOT)) {
  const ext = extname(file).toLowerCase();
  if (!IMAGE_EXT.has(ext)) continue;
  if (file.includes("/images/certificate/thumbs/")) continue;

  const rule = RULES.find((r) => r.test(file));
  if (!rule) {
    console.log(`SKIP (no rule): ${file}`);
    continue;
  }

  const before = (await stat(file)).size;
  const outExt = rule.keepFormat ? ext : ".webp";
  const outFile = file.slice(0, -ext.length) + outExt;

  let pipeline = sharp(file).rotate(); // respect EXIF orientation
  const meta = await sharp(file).metadata();
  const needsResize = (meta.width ?? 0) > rule.width;
  if (needsResize) {
    pipeline = pipeline.resize({ width: rule.width, withoutEnlargement: true });
  }

  if (rule.keepFormat && ext === ".png") {
    await pipeline.png({ compressionLevel: 9, palette: true }).toFile(outFile);
  } else if (rule.keepFormat) {
    await pipeline.jpeg({ mozjpeg: true, quality: rule.quality }).toFile(outFile);
  } else {
    await pipeline.webp({ quality: rule.quality }).toFile(outFile);
  }

  const after = (await stat(outFile)).size;
  if (outFile !== file) await unlink(file);

  totalBefore += before;
  totalAfter += after;
  count++;
  console.log(
    `${basename(file)} → ${basename(outFile)}: ${fmt(before)} → ${fmt(after)} (-${Math.round((1 - after / before) * 100)}%)`
  );
}

console.log(`\nDone. ${count} images. Total: ${fmt(totalBefore)} → ${fmt(totalAfter)} (-${Math.round((1 - totalAfter / totalBefore) * 100)}%)`);
