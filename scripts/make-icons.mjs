// 由 public/Logo.png 產生網站圖示：取 Logo 左邊的「富聯」二字，白字放在富聯深藍底上
// 用法：npm run icons
//   輸出 src/app/favicon.ico（瀏覽器分頁，16/32/48px）
//   輸出 src/app/icon.png（512px，高解析度圖示）
//   輸出 src/app/apple-icon.png（180px，iPhone 加入主畫面）
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const root = path.resolve(import.meta.dirname, "..");
const NAVY = "#132433";
// 「富聯」位在 Logo 左側、中間分隔線之前（Logo 寬度的前 45%）
const GLYPH_REGION = 0.45;

const logo = await loadImage(path.join(root, "public", "Logo.png"));

// 找出「富聯」二字實際的範圍（不透明像素的邊界）
function glyphBounds() {
  const w = Math.floor(logo.width * GLYPH_REGION);
  const h = logo.height;
  const c = createCanvas(w, h);
  const ctx = c.getContext("2d");
  ctx.drawImage(logo, 0, 0);
  const { data } = ctx.getImageData(0, 0, w, h);
  let x0 = w, y0 = h, x1 = 0, y1 = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 128) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

const glyph = glyphBounds();

// 把「富聯」染成白色
const white = createCanvas(glyph.w, glyph.h);
{
  const ctx = white.getContext("2d");
  ctx.drawImage(logo, glyph.x, glyph.y, glyph.w, glyph.h, 0, 0, glyph.w, glyph.h);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, glyph.w, glyph.h);
}

/**
 * @param size 輸出尺寸
 * @param radius 圓角比例（0 = 直角，iPhone 會自己裁圓角）
 * @param padding 字與邊緣的留白比例；小尺寸留白少一點，字才看得清楚
 */
function render(size, { radius, padding }) {
  const c = createCanvas(size, size);
  const ctx = c.getContext("2d");
  ctx.fillStyle = NAVY;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * radius);
  ctx.fill();

  const inner = size * (1 - padding * 2);
  const scale = Math.min(inner / glyph.w, inner / glyph.h);
  const w = glyph.w * scale;
  const h = glyph.h * scale;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(white, (size - w) / 2, (size - h) / 2, w, h);
  return c.encode("png");
}

// ICO 檔：直接包 PNG（現代瀏覽器都支援）
function toIco(pngs) {
  const header = Buffer.alloc(6 + 16 * pngs.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = header.length;
  pngs.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt8(0, e + 2);
    header.writeUInt8(0, e + 3);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...pngs.map((p) => p.data)]);
}

const appDir = path.join(root, "src", "app");
const small = await Promise.all(
  [16, 32, 48].map(async (size) => ({ size, data: await render(size, { radius: 0.2, padding: 0.06 }) })),
);
await writeFile(path.join(appDir, "favicon.ico"), toIco(small));
await writeFile(path.join(appDir, "icon.png"), await render(512, { radius: 0.2, padding: 0.12 }));
await writeFile(path.join(appDir, "apple-icon.png"), await render(180, { radius: 0, padding: 0.14 }));

console.log(`完成：「富聯」範圍 ${glyph.w}×${glyph.h}px → src/app/favicon.ico、icon.png、apple-icon.png`);
