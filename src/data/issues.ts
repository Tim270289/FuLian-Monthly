export type Credit = {
  /** 職稱，例如 總編輯 */
  role: string;
  name: string;
  /** 補充說明，例如所屬產業 */
  note?: string;
};

export type Issue = {
  /** 期別代號，同時是 PDF 檔名與網址，例如 2026-11-001 */
  id: string;
  /** 首頁與閱讀頁顯示的名稱 */
  title: string;
  /** 頁數，由 npm run pages 轉檔後印出 */
  pages: number;
  /** 本期製作團隊，顯示在閱讀頁下方；沒填就不顯示 */
  credits?: Credit[];
};

// 每月新增一期：
// 1. 把 PDF 放進專案根目錄的 pdf/，檔名用期別代號（例如 pdf/2026-12-002.pdf）
// 2. 執行 npm run pages -- 2026-12-002，轉出網頁用的頁面圖片與封面
// 3. 在陣列最上方加一筆
export const issues: Issue[] = [
  {
    id: "2026-11-001",
    title: "富聯月刊001期/2026年11月",
    pages: 14,
    credits: [
      { role: "總編輯", name: "洪孟新", note: "塗料雕塑藝術工程" },
      { role: "校稿", name: "陳奎翔", note: "社群經營" },
    ],
  },
];

const pad = (n: number, total: number) => String(n).padStart(Math.max(2, String(total).length), "0");

export const coverOf = (issue: Issue) => `/issues/${issue.id}/cover.jpg`;

/** 分享到 LINE / Facebook 的預覽圖（1200×630），由 npm run og 產生 */
export const ogImageOf = (issue: Issue) => `/issues/${issue.id}/og.jpg`;

export const pagesOf = (issue: Issue) =>
  Array.from({ length: issue.pages }, (_, i) => `/issues/${issue.id}/${pad(i + 1, issue.pages)}.jpg`);
