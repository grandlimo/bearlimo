// One-off image optimization for the AETERNUS site.
// Generates AVIF/WebP (and an optimized fallback where the source is huge)
// next to the originals in src/assets/images/. NOT part of the Eleventy build —
// run manually after adding/changing source images:  npm run optimize:images
//
// Rationale: pre-generating committed derivatives keeps the Netlify build free
// of native image deps and makes output fully predictable.
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "src", "assets", "images");
const kb = (f) => (fs.statSync(f).size / 1024).toFixed(0);

async function gen(srcName, outputs) {
  const src = path.join(DIR, srcName);
  const meta = await sharp(src).metadata();
  console.log(
    `\n${srcName}: ${meta.width}x${meta.height} ${meta.format} alpha=${meta.hasAlpha} (${kb(src)} KB)`
  );
  for (const o of outputs) {
    const out = path.join(DIR, o.name);
    let pipe = sharp(src);
    if (o.avif) pipe = pipe.avif(o.avif);
    else if (o.webp) pipe = pipe.webp(o.webp);
    else if (o.jpeg) pipe = pipe.jpeg(o.jpeg);
    else if (o.png) pipe = pipe.png(o.png);
    await pipe.toFile(out);
    console.log(`  -> ${o.name}: ${kb(out)} KB`);
  }
}

(async () => {
  // Hero (LCP) — photo, no alpha. Keep original .jpg as fallback (also used as og:image).
  await gen("hero-library.jpg", [
    { name: "hero-library.avif", avif: { quality: 52, effort: 4 } },
    { name: "hero-library.webp", webp: { quality: 78 } },
  ]);

  // Featured cover — the 3.2 MB offender. Generate modern formats + an optimized JPEG fallback.
  await gen("book-hunted.png", [
    { name: "book-hunted.avif", avif: { quality: 55, effort: 4 } },
    { name: "book-hunted.webp", webp: { quality: 80 } },
    { name: "book-hunted-fallback.jpg", jpeg: { quality: 84, mozjpeg: true } },
  ]);

  // Logo — graphic with alpha. Near-lossless to keep edges/text crisp; PNG stays as fallback.
  await gen("logo.png", [
    { name: "logo.avif", avif: { quality: 72, effort: 4 } },
    { name: "logo.webp", webp: { quality: 92, alphaQuality: 100 } },
  ]);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
