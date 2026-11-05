"use client";

import { useEffect } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

type Props = {
  pages: string[];
  index: number;
  onChange: (index: number) => void;
  onClose: () => void;
};

// 全螢幕放大閱讀：手機雙指縮放、電腦滾輪縮放，雙擊切換放大
export default function PageZoom({ pages, index, onChange, onClose }: Props) {
  const total = pages.length;
  const prev = () => index > 0 && onChange(index - 1);
  const next = () => index < total - 1 && onChange(index + 1);

  // 開啟時鎖住背景捲動；Esc 關閉、左右鍵換頁
  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  });

  const btn =
    "rounded-md border border-white/25 px-3 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-30";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="放大閱讀"
      className="fixed inset-0 z-50 flex h-dvh flex-col bg-stone-950"
    >
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="text-sm tabular-nums">
          第 {index + 1} / {total} 頁
        </span>
        <button type="button" onClick={onClose} className={btn} aria-label="關閉放大閱讀">
          ✕ 關閉
        </button>
      </div>

      {/* key 讓換頁時縮放狀態重設 */}
      <TransformWrapper
        key={index}
        minScale={1}
        maxScale={5}
        centerOnInit
        doubleClick={{ mode: "toggle", step: 1.5 }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="min-h-0 flex-1">
              <TransformComponent
                wrapperStyle={{ width: "100%", height: "100%" }}
                contentStyle={{ width: "100%", height: "100%" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- 已預先轉好尺寸的頁面圖片，直接顯示 */}
                <img
                  src={pages[index]}
                  alt={`第 ${index + 1} 頁`}
                  className="h-full w-full object-contain"
                  draggable={false}
                />
              </TransformComponent>
            </div>

            <div className="flex flex-col items-center gap-2 px-4 py-3">
              <div className="flex items-center gap-2">
                <button type="button" onClick={prev} disabled={index === 0} className={btn}>
                  上一頁
                </button>
                <button type="button" onClick={() => zoomOut()} className={btn} aria-label="縮小">
                  －
                </button>
                <button type="button" onClick={() => resetTransform()} className={btn}>
                  原尺寸
                </button>
                <button type="button" onClick={() => zoomIn()} className={btn} aria-label="放大">
                  ＋
                </button>
                <button type="button" onClick={next} disabled={index === total - 1} className={btn}>
                  下一頁
                </button>
              </div>
              <p className="text-xs text-white/50">雙指或滾輪縮放・雙擊放大・拖曳移動</p>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
