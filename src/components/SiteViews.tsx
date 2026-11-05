"use client";

import { useEffect, useState } from "react";
import { formatCount, recordView } from "@/lib/stats-client";

// 放在根版面：不論從哪一頁進站，都記一次網站瀏覽
export function SiteVisitTracker() {
  useEffect(() => {
    recordView("site");
  }, []);
  return null;
}

// 首頁顯示「本站累計瀏覽 N 次」；資料庫無法使用時不顯示
export default function SiteViews() {
  const [views, setViews] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    recordView("site").then((stats) => {
      if (stats) setViews(stats.views);
      else setFailed(true);
    });
  }, []);

  if (failed) return null;

  return (
    <p className="flex items-center gap-1.5 text-sm text-stone-500">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2}>
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      本站累計瀏覽
      <span className="min-w-6 font-semibold tabular-nums text-stone-700">
        {views === null ? "—" : formatCount(views)}
      </span>
      次
    </p>
  );
}
