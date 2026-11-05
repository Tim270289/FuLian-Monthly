"use client";

import { useEffect, useState } from "react";
import { formatCount, hasLiked, recordView, toggleLike, type Stats } from "@/lib/stats-client";

// 閱讀頁標題下方：本期瀏覽次數＋愛心按鈕（喜歡這期）；資料庫無法使用時不顯示
export default function IssueStats({ issueId }: { issueId: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [liked, setLiked] = useState(false);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  // 每次按下喜歡時遞增，用來重新播放愛心的彈跳動畫
  const [pop, setPop] = useState(0);

  useEffect(() => {
    recordView(issueId).then((s) => {
      if (!s) return setFailed(true);
      setStats(s);
      setLiked(hasLiked(issueId));
    });
  }, [issueId]);

  if (failed) return null;

  const onLike = async () => {
    if (!stats || busy) return;
    const next = !liked;
    // 先更新畫面，失敗再還原
    setBusy(true);
    setLiked(next);
    setStats({ ...stats, likes: Math.max(0, stats.likes + (next ? 1 : -1)) });
    if (next) setPop((n) => n + 1);
    const updated = await toggleLike(issueId, next);
    if (updated) setStats(updated);
    else {
      setLiked(!next);
      setStats(stats);
    }
    setBusy(false);
  };

  return (
    <div className="mb-6 flex items-center justify-center gap-5 text-sm text-stone-500 dark:text-stone-400">
      <span className="flex items-center gap-1.5">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2}>
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <span className="tabular-nums">{stats ? formatCount(stats.views) : "—"}</span> 次瀏覽
      </span>

      <button
        type="button"
        onClick={onLike}
        disabled={!stats}
        aria-pressed={liked}
        aria-label={liked ? "收回喜歡" : "喜歡這期月刊"}
        className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 transition disabled:opacity-50 ${
          liked
            ? "border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-500/50 dark:bg-rose-500/15 dark:text-rose-300"
            : "border-stone-300 bg-white text-stone-600 hover:border-rose-300 hover:text-rose-600 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:text-rose-300"
        }`}
      >
        <svg
          key={pop}
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`h-4 w-4 stroke-current ${liked ? "fill-current" : "fill-none"} ${pop > 0 ? "heart-pop" : ""}`}
          strokeWidth={2}
        >
          <path
            d="M12 21s-7.5-4.6-9.6-9.4C.9 8.2 3 4.5 6.6 4.5c2.1 0 3.6 1.2 4.4 2.6.8-1.4 2.3-2.6 4.4-2.6 3.6 0 5.7 3.7 4.2 7.1C19.5 16.4 12 21 12 21Z"
            strokeLinejoin="round"
          />
        </svg>
        {liked ? "已喜歡" : "喜歡"}
        <span className="tabular-nums font-semibold">{stats ? formatCount(stats.likes) : "—"}</span>
      </button>
    </div>
  );
}
