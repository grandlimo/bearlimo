// Recompose the combined wordmark logo so the Ω symbol matches the CAP HEIGHT of
// the "AETERNUS VERLAG" text (currently the symbol is much taller).
// Detects symbol vs. text by scanning alpha columns, scales the symbol to the
// text height, and recomposites side-by-side on a transparent canvas.
// Output: src/assets/images/logo-fixed.png  (review before replacing logo.png)
const sharp = require("sharp");
const path = require("path");
const DIR = path.join(__dirname, "..", "src", "assets", "images");
const SRC = path.join(DIR, "logo.png");
const A = 16;      // alpha threshold for "has content"
const GAP = 16;    // min empty columns that separate symbol from text

(async () => {
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const colHas = new Array(W).fill(false);
  const colMinY = new Array(W).fill(H), colMaxY = new Array(W).fill(-1);
  for (let x = 0; x < W; x++)
    for (let y = 0; y < H; y++) {
      if (data[(y * W + x) * C + 3] > A) {
        colHas[x] = true;
        if (y < colMinY[x]) colMinY[x] = y;
        if (y > colMaxY[x]) colMaxY[x] = y;
      }
    }
  // contiguous content runs
  const runs = [];
  let start = -1;
  for (let x = 0; x <= W; x++) {
    if (x < W && colHas[x]) { if (start < 0) start = x; }
    else if (start >= 0) { runs.push([start, x - 1]); start = -1; }
  }
  // group runs separated by < GAP
  const groups = [];
  for (const [a, b] of runs) {
    if (groups.length && a - groups[groups.length - 1][1] - 1 < GAP) groups[groups.length - 1][1] = b;
    else groups.push([a, b]);
  }
  console.log("groups (x-ranges):", JSON.stringify(groups));
  const sym = groups[0];
  const text = [groups[1][0], groups[groups.length - 1][1]];
  const yRange = (x0, x1) => {
    let mn = H, mx = -1;
    for (let x = x0; x <= x1; x++) { if (colMinY[x] < mn) mn = colMinY[x]; if (colMaxY[x] > mx) mx = colMaxY[x]; }
    return [mn, mx];
  };
  const [symY0, symY1] = yRange(sym[0], sym[1]);
  const [txtY0, txtY1] = yRange(text[0], text[1]);
  const symW = sym[1] - sym[0] + 1, symH = symY1 - symY0 + 1;
  const txtW = text[1] - text[0] + 1, txtH = txtY1 - txtY0 + 1;
  console.log(`symbol box ${symW}x${symH} @x${sym[0]}  |  text box ${txtW}x${txtH} @x${text[0]}`);

  const targetH = txtH;                                   // symbol -> text cap height
  const newSymW = Math.round(symW * targetH / symH);
  const gap = Math.round(targetH * 0.45);
  const pad = 2;
  const cW = pad + newSymW + gap + txtW + pad;
  const cH = pad + targetH + pad;

  const symBuf = await sharp(SRC).extract({ left: sym[0], top: symY0, width: symW, height: symH }).resize(newSymW, targetH).png().toBuffer();
  const txtBuf = await sharp(SRC).extract({ left: text[0], top: txtY0, width: txtW, height: txtH }).png().toBuffer();

  await sharp({ create: { width: cW, height: cH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: symBuf, left: pad, top: pad },
      { input: txtBuf, left: pad + newSymW + gap, top: pad },
    ])
    .png()
    .toFile(path.join(DIR, "logo-fixed.png"));
  console.log(`logo-fixed.png: ${cW}x${cH}  (symbol ${newSymW}x${targetH}, gap ${gap}, text ${txtW}x${txtH})`);
})().catch((e) => { console.error(e); process.exit(1); });
