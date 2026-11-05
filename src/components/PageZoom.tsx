"use client";

import { useEffect, useRef, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

type Props = {
  pages: string[];
  index: number;
  onChange: (index: number) => void;
  onClose: () => void;
};

// 判定為「左右滑動翻頁」的門檻
const SWIPE_MIN_DISTANCE = 60;
const SWIPE_MAX_DURATION = 800;

// 全螢幕放大閱讀：手機雙指縮放、電腦滾輪縮放，雙擊切換放大
// 換頁：左右箭頭、下方按鈕、鍵盤左右鍵，或在未放大時左右滑動
export default function PageZoom({ pages, index, onChange, onClose }: Props) {
  const total = pages.length;
  // 換頁方向決定翻頁動畫從哪一側轉入；剛開啟時為 null（淡入）
  const [direction, setDirection] = useState<"next" | "prev" | null>(null);
  const scaleRef = useRef(1);
  const gestureRef = useRef<{ x: number; y: number; t: number; pointers: Set<number>; multi: boolean }>({
    x: 0,
    y: 0,
    t: 0,
    pointers: new Set(),
    multi: false,
  });

  const prev = () => {
    if (index === 0) return;
    setDirection("prev");
    onChange(index - 1);
  };
  const next = () => {
    if (index === total - 1) return;
    setDirection("next");
    onChange(index + 1);
  };

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

  // 左右滑動翻頁：只在沒有放大、單指操作時才算，放大後的拖曳交給縮放套件移動畫面
  // 縮放套件會攔下 mouse / touch 事件，所以這裡用 pointer 事件的捕獲階段偵測
  const onPointerDown = (e: React.PointerEvent) => {
    const g = gestureRef.current;
    g.pointers.add(e.pointerId);
    if (g.pointers.size === 1) {
      g.x = e.clientX;
      g.y = e.clientY;
      g.t = e.timeStamp;
      g.multi = false;
    } else {
      g.multi = true;
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const g = gestureRef.current;
    if (!g.pointers.delete(e.pointerId) || g.pointers.size > 0 || g.multi) return;
    if (scaleRef.current > 1.01) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (e.timeStamp - g.t > SWIPE_MAX_DURATION) return;
    if (Math.abs(dx) < SWIPE_MIN_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < 0) next();
    else prev();
  };
  const onPointerCancel = (e: React.PointerEvent) => {
    gestureRef.current.pointers.delete(e.pointerId);
  };

  const btn =
    "rounded-md border border-white/25 px-3 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-30";
  const edgeBtn =
    "absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-2xl text-white backdrop-blur-sm transition hover:bg-black/65";
  const turnClass =
    direction === "next" ? "page-turn-next" : direction === "prev" ? "page-turn-prev" : "page-turn-in";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="放大閱讀"
      className="fixed inset-0 z-50 flex h-dvh flex-col overflow-hidden bg-stone-950"
    >
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="text-sm tabular-nums">
          第 {index + 1} / {total} 頁
        </span>
        <button type="button" onClick={onClose} className={btn} aria-label="關閉放大閱讀">
          ✕ 關閉
        </button>
      </div>

      {/* key 讓換頁時縮放狀態重設，並重新播放翻頁動畫 */}
      <TransformWrapper
        key={index}
        minScale={1}
        maxScale={5}
        centerOnInit
        doubleClick={{ mode: "toggle", step: 1.5 }}
        onTransform={(_, state) => {
          scaleRef.current = state.scale;
        }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div
              className="relative min-h-0 flex-1 touch-none overflow-hidden"
              onPointerDownCapture={onPointerDown}
              onPointerUpCapture={onPointerUp}
              onPointerCancelCapture={onPointerCancel}
            >
              <div className={`h-full w-full ${turnClass}`}>
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

              {index > 0 && (
                <button type="button" onClick={prev} className={`${edgeBtn} left-2 sm:left-4`} aria-label="上一頁">
                  ‹
                </button>
              )}
              {index < total - 1 && (
                <button type="button" onClick={next} className={`${edgeBtn} right-2 sm:right-4`} aria-label="下一頁">
                  ›
                </button>
              )}
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
              <p className="text-xs text-white/50">左右滑動或點兩側箭頭翻頁・雙指或滾輪縮放・雙擊放大</p>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
