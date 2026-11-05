// 產生分享到 LINE / Facebook 時的預覽圖（1200×630 橫式）
// 用法：npm run og -- 2026-11-001
//   讀取 public/issues/2026-11-001/cover.jpg，輸出 public/issues/2026-11-001/og.jpg
// npm run pages 轉檔時也會自動執行
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const WIDTH = 1200;
const HEIGHT = 630;
// 富聯 Logo 的深藍色
const BACKGROUND = "#132433";

export async function makeOgImage(issueDir) {
  const cover = await loadImage(path.join(issueDir, "cover.jpg"));
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // 背景：放大並模糊的封面，再蓋一層深藍，讓中間的封面更突出
  const bgScale = WIDTH / cover.width;
  ctx.filter = "blur(24px)";
  ctx.drawImage(cover, 0, (HEIGHT - cover.height * bgScale) / 2, WIDTH, cover.height * bgScale);
  ctx.filter = "none";
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = BACKGROUND;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.globalAlpha = 1;

  // 中間：完整的封面，上下留白
  const h = HEIGHT - 60;
  const w = (cover.width / cover.height) * h;
  const x = (WIDTH - w) / 2;
  ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
  ctx.shadowBlur = 30;
  ctx.drawImage(cover, x, 30, w, h);

  await writeFile(path.join(issueDir, "og.jpg"), await canvas.encode("jpeg", 85));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const id = process.argv[2];
  if (!id) {
    console.error("請指定期別，例如：npm run og -- 2026-11-001");
    process.exit(1);
  }
  const dir = path.resolve(import.meta.dirname, "..", "public", "issues", id);
  await makeOgImage(dir);
  console.log(`完成：public/issues/${id}/og.jpg`);
}
