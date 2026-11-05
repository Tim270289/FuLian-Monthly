"use client";

import { useEffect, useState } from "react";
import { formatCount, getIssueStats } from "@/lib/stats-client";

// 首頁卡片期名下方的「♥ 喜歡數」；資料庫無法使用時不顯示
export default function IssueLikeCount({ issueId }: { issueId: string }) {
  const [likes, setLikes] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    getIssueStats(issueId).then((stats) => {
      if (stats) setLikes(stats.likes);
      else setFailed(true);
    });
  }, [issueId]);

  if (failed) return null;

  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-stone-500" aria-label={`${likes ?? 0} 人喜歡`}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-rose-500 stroke-rose-500" strokeWidth={2}>
        <path
          d="M12 21s-7.5-4.6-9.6-9.4C.9 8.2 3 4.5 6.6 4.5c2.1 0 3.6 1.2 4.4 2.6.8-1.4 2.3-2.6 4.4-2.6 3.6 0 5.7 3.7 4.2 7.1C19.5 16.4 12 21 12 21Z"
          strokeLinejoin="round"
        />
      </svg>
      <span className="tabular-nums">{likes === null ? "—" : formatCount(likes)}</span>
    </p>
  );
}
