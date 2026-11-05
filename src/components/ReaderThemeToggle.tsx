"use client";

import { useSyncExternalStore } from "react";
import { READER_THEME_ATTRIBUTE, READER_THEME_STORAGE_KEY } from "@/lib/reader-theme";

// 閱讀頁的深色 / 淺色模式切換按鈕
// 狀態存在 <html data-reader-theme> 與 localStorage；
// 根版面的內聯腳本會在畫面繪製前套用上次的選擇（見 READER_THEME_SCRIPT）
const EVENT = "reader-theme-change";

type Theme = "light" | "dark";

const subscribe = (callback: () => void) => {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
};
const getSnapshot = (): Theme =>
  document.documentElement.getAttribute(READER_THEME_ATTRIBUTE) === "dark" ? "dark" : "light";
const getServerSnapshot = (): Theme => "light";

function setTheme(theme: Theme) {
  if (theme === "dark") document.documentElement.setAttribute(READER_THEME_ATTRIBUTE, "dark");
  else document.documentElement.removeAttribute(READER_THEME_ATTRIBUTE);
  try {
    localStorage.setItem(READER_THEME_STORAGE_KEY, theme);
  } catch {
    // 無痕模式等無法儲存時，只套用本次
  }
  window.dispatchEvent(new Event(EVENT));
}

export default function ReaderThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "切換為淺色閱讀模式" : "切換為深色閱讀模式"}
      title={isDark ? "淺色模式" : "深色模式"}
      className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-stone-300 px-3 text-sm text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
    >
      {isDark ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2}>
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2}>
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" strokeLinejoin="round" />
        </svg>
      )}
      <span className="hidden sm:inline">{isDark ? "淺色" : "深色"}</span>
    </button>
  );
}
