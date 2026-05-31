// Generates brand PNG icons (no external deps) using zlib for PNG encoding.
// Draws a map-pin mark in white + gold on the deep-blue primary (#002863),
// matching the MT Empresarial "Aero-Corporate Precision" design system.
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const root = dirname(fileURLToPath(import.meta.url));
const OUT = join(root, "icons");
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const C = {
  bgTop: [0, 40, 99],     // #002863 primary
  bgBot: [0, 25, 68],     // #001944 deeper
  white: [255, 255, 255],
  gold: [247, 189, 61],   // #f7bd3d tertiary-fixed-dim
};

function lerp(a, b, t) { return a + (b - a) * t; }

function draw(size, scale) {
  // RGBA buffer
  const px = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const headCy = size * 0.40;
  const headR = size * 0.20 * scale;
  const holeR = headR * 0.42;
  const ringOuter = headR * 1.16;
  // tail triangle vertices
  const tL = [cx - headR * 0.80, headCy + headR * 0.50];
  const tR = [cx + headR * 0.80, headCy + headR * 0.50];
  const tB = [cx, headCy + headR * 2.45];

  const sign = (px1, py1, ax, ay, bx, by) =>
    (px1 - bx) * (ay - by) - (ax - bx) * (py1 - by);
  const inTri = (x, y) => {
    const d1 = sign(x, y, tL[0], tL[1], tR[0], tR[1]);
    const d2 = sign(x, y, tR[0], tR[1], tB[0], tB[1]);
    const d3 = sign(x, y, tB[0], tB[1], tL[0], tL[1]);
    const neg = d1 < 0 || d2 < 0 || d3 < 0;
    const pos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(neg && pos);
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const t = y / size;
      let col = [
        Math.round(lerp(C.bgTop[0], C.bgBot[0], t)),
        Math.round(lerp(C.bgTop[1], C.bgBot[1], t)),
        Math.round(lerp(C.bgTop[2], C.bgBot[2], t)),
      ];
      const dh = Math.hypot(x - cx, y - headCy);
      if (dh <= ringOuter && dh > headR) col = C.gold;          // gold ring
      if (dh <= headR || inTri(x, y)) col = C.white;            // pin body
      if (dh <= holeR) col = C.bgTop;                            // hole
      const i = (y * size + x) * 4;
      px[i] = col[0]; px[i + 1] = col[1]; px[i + 2] = col[2]; px[i + 3] = 255;
    }
  }
  return px;
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function encodePNG(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit, RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter none
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0)),
  ]);
}

const jobs = [
  ["icon-192.png", 192, 1.0],
  ["icon-512.png", 512, 1.0],
  ["icon-maskable-512.png", 512, 0.72], // content inside safe zone
  ["apple-touch-icon.png", 180, 0.95],
];
for (const [name, size, scale] of jobs) {
  writeFileSync(join(OUT, name), encodePNG(size, draw(size, scale)));
  console.log("wrote", name);
}
console.log("icons done");
