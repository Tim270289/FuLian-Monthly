// 把月刊 PDF 轉成網頁用的頁面圖片與封面縮圖
// 用法：npm run pages -- 2026-11-001
//   讀取 pdf/2026-11-001.pdf
//   輸出 public/issues/2026-11-001/01.jpg、02.jpg…（翻書用）
//   輸出 public/issues/2026-11-001/cover.jpg（首頁縮圖）
//   輸出 public/issues/2026-11-001/og.jpg（分享到 LINE / Facebook 的預覽圖）
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { createCanvas } from "@napi-rs/canvas";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { makeOgImage } from "./og-image.mjs";

// 翻書頁面寬度（px）：跨頁時單頁約 700 CSS px，兩倍解析度讓高解析螢幕也清楚
const PAGE_WIDTH = 1600;
const COVER_WIDTH = 600;
const JPEG_QUALITY = 82;

const id = process.argv[2];
if (!id) {
  console.error("請指定期別，例如：npm run pages -- 2026-11-001");
  process.exit(1);
}

const root = path.resolve(import.meta.dirname, "..");
const pdfPath = path.join(root, "pdf", `${id}.pdf`);
const outDir = path.join(root, "public", "issues", id);

async function renderPage(pdfPage, width) {
  const base = pdfPage.getViewport({ scale: 1 });
  const viewport = pdfPage.getViewport({ scale: width / base.width });
  const canvas = createCanvas(Math.round(viewport.width), Math.round(viewport.height));
  await pdfPage.render({ canvas, viewport }).promise;
  return canvas.encode("jpeg", JPEG_QUALITY);
}

const data = new Uint8Array(await readFile(pdfPath));
const task = getDocument({ data });
const pdf = await task.promise;

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const digits = String(pdf.numPages).length < 2 ? 2 : String(pdf.numPages).length;
let total = 0;
for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i);
  const jpg = await renderPage(page, PAGE_WIDTH);
  await writeFile(path.join(outDir, `${String(i).padStart(digits, "0")}.jpg`), jpg);
  if (i === 1) await writeFile(path.join(outDir, "cover.jpg"), await renderPage(page, COVER_WIDTH));
  total += jpg.length;
  page.cleanup();
  console.log(`第 ${i} / ${pdf.numPages} 頁完成（${(jpg.length / 1024).toFixed(0)} KB）`);
}

await task.destroy();
await makeOgImage(outDir);
console.log(`\n完成：${pdf.numPages} 頁，共 ${(total / 1024 / 1024).toFixed(1)} MB → public/issues/${id}/`);
console.log(`請在 src/data/issues.ts 填入 pages: ${pdf.numPages}`);
