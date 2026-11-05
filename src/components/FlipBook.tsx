"use client";

import { useEffect, useRef, useState } from "react";
import type { PageFlip } from "page-flip";

export default function FlipBook({ pages }: { pages: string[] }) {
  const bookRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<PageFlip | null>(null);
  const [ratio, setRatio] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  // 1. 先載入第一頁，取得頁面比例（其餘頁面在背景載入）
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.src = pages[0];
    img
      .decode()
      .then(() => {
        if (!cancelled) setRatio(img.naturalHeight / img.naturalWidth);
      })
      .catch(() => {
        if (!cancelled) setError("月刊載入失敗，請稍後再試。");
      });
    return () => {
      cancelled = true;
    };
  }, [pages]);

  // 2. 交給 page-flip 做翻書效果
  //    page-flip 會直接改寫並在 destroy 時移除 DOM，所以書本元素在 React 之外手動建立
  useEffect(() => {
    const host = bookRef.current;
    if (!ratio || !host) return;

    let flip: PageFlip | null = null;
    let cancelled = false;

    const el = document.createElement("div");
    pages.forEach((url, i) => {
      const pageEl = document.createElement("div");
      pageEl.className = "flip-page bg-white";
      const img = document.createElement("img");
      img.src = url;
      img.alt = `第 ${i + 1} 頁`;
      img.className = "h-full w-full object-contain";
      pageEl.appendChild(img);
      el.appendChild(pageEl);
    });
    host.appendChild(el);

    (async () => {
      const { PageFlip } = await import("page-flip");
      if (cancelled) return;

      const width = 550;
      flip = new PageFlip(el, {
        width,
        height: Math.round(width * ratio),
        size: "stretch",
        minWidth: 280,
        maxWidth: 1000,
        minHeight: Math.round(280 * ratio),
        maxHeight: Math.round(1000 * ratio),
        showCover: true,
        maxShadowOpacity: 0.5,
        flippingTime: 800,
        mobileScrollSupport: false,
      });
      flip.loadFromHTML(el.querySelectorAll<HTMLElement>(".flip-page"));
      flip.on("flip", (e) => setPage(e.data));
      flipRef.current = flip;
    })();

    return () => {
      cancelled = true;
      flip?.destroy();
      el.remove();
      flipRef.current = null;
    };
  }, [pages, ratio]);

  // 鍵盤左右鍵翻頁
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") flipRef.current?.flipNext();
      if (e.key === "ArrowLeft") flipRef.current?.flipPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (error) {
    return <p className="py-20 text-center text-red-600">{error}</p>;
  }

  if (!ratio) {
    return <p className="py-24 text-center text-stone-600">月刊載入中…</p>;
  }

  const total = pages.length;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 依螢幕高度限制書本寬度（跨頁 = 2 頁寬），讓整本書和翻頁按鈕都留在畫面內 */}
      <div
        ref={bookRef}
        className="mx-auto w-full"
        style={{ maxWidth: `max(560px, calc((100vh - 240px) / ${ratio} * 2))` }}
      />

      <div className="flex items-center gap-4 text-sm text-stone-700">
        <button
          type="button"
          onClick={() => flipRef.current?.flipPrev()}
          disabled={page === 0}
          className="rounded-md border border-stone-300 bg-white px-4 py-2 hover:bg-stone-100 disabled:opacity-40"
        >
          上一頁
        </button>
        <span className="min-w-20 text-center tabular-nums">
          {page + 1} / {total}
        </span>
        <button
          type="button"
          onClick={() => flipRef.current?.flipNext()}
          disabled={page >= total - 1}
          className="rounded-md border border-stone-300 bg-white px-4 py-2 hover:bg-stone-100 disabled:opacity-40"
        >
          下一頁
        </button>
      </div>
    </div>
  );
}
