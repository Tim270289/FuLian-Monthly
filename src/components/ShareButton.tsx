"use client";

import { useEffect, useRef, useState } from "react";

type Target = { name: string; badge: string; color: string; href: (url: string, title: string) => string };

const TARGETS: Target[] = [
  {
    name: "LINE",
    badge: "L",
    color: "bg-[#06C755]",
    href: (url) => `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`,
  },
  {
    name: "Facebook",
    badge: "f",
    color: "bg-[#1877F2]",
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: "Threads",
    badge: "@",
    color: "bg-black",
    href: (url, title) => `https://www.threads.net/intent/post?text=${encodeURIComponent(`${title}\n${url}`)}`,
  },
];

// 全站右下角的浮動分享按鈕，分享目前所在的頁面
export default function ShareButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // 點選單外面或按 Esc 時關閉
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // 分享乾淨的網址（不帶 ?query 與 #hash）
  const current = () => ({ url: location.origin + location.pathname, title: document.title });

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(current().url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("請複製這個連結：", current().url);
    }
  };

  const nativeShare = async () => {
    const { url, title } = current();
    try {
      await navigator.share({ title, url });
      setOpen(false);
    } catch {
      // 使用者取消分享，不需處理
    }
  };

  const item =
    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-stone-800 hover:bg-stone-100";
  const badge = "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white";

  return (
    <div ref={rootRef} className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 sm:bottom-8 sm:right-8">
      {open && (
        <div role="menu" aria-label="分享到" className="w-52 rounded-xl bg-white p-2 shadow-xl ring-1 ring-stone-200">
          <p className="px-3 pb-1 pt-1.5 text-xs text-stone-500">分享這個頁面</p>
          {TARGETS.map((t) => (
            <button
              key={t.name}
              type="button"
              role="menuitem"
              className={item}
              onClick={() => {
                const { url, title } = current();
                window.open(t.href(url, title), "_blank", "noopener,noreferrer,width=600,height=600");
                setOpen(false);
              }}
            >
              <span className={`${badge} ${t.color}`}>{t.badge}</span>
              {t.name}
            </button>
          ))}
          <button type="button" role="menuitem" className={item} onClick={copyLink}>
            <span className={`${badge} bg-stone-500`}>
              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth={2}>
                <path d="M8 12a4 4 0 0 0 5.66 0l2.83-2.83a4 4 0 0 0-5.66-5.66L9.5 4.83" strokeLinecap="round" />
                <path d="M12 8a4 4 0 0 0-5.66 0L3.5 10.83a4 4 0 0 0 5.66 5.66l1.33-1.33" strokeLinecap="round" />
              </svg>
            </span>
            {copied ? "已複製連結 ✓" : "複製連結"}
          </button>
          {canNativeShare && (
            <button type="button" role="menuitem" className={item} onClick={nativeShare}>
              <span className={`${badge} bg-stone-800`}>…</span>
              更多分享方式
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        aria-label={open ? "關閉分享選單" : "分享這個頁面"}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => {
          // 只有瀏覽器支援系統分享選單時，才顯示「更多分享方式」
          setCanNativeShare(typeof navigator.share === "function");
          setOpen((v) => !v);
        }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#132433] text-white shadow-lg transition hover:scale-105 hover:bg-[#1d3447]"
      >
        {open ? (
          <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.2}>
            <path d="M5 5l10 10M15 5 5 15" strokeLinecap="round" />
          </svg>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth={2}>
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
          </svg>
        )}
      </button>
    </div>
  );
}
