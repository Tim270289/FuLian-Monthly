// 瀏覽器端呼叫 /api/stats 的小工具
// 瀏覽次數：同一個瀏覽器在一次造訪（分頁開著期間）內只計一次，避免重新整理灌水
// 喜歡：用 localStorage 記住這個瀏覽器按過哪些期，可以再按一次收回

export type Stats = { views: number; likes: number };

async function call(init?: RequestInit, key?: string): Promise<Stats | null> {
  try {
    const res = await fetch(key ? `/api/stats?key=${encodeURIComponent(key)}` : "/api/stats", init);
    return res.ok ? ((await res.json()) as Stats) : null;
  } catch {
    return null;
  }
}

const post = (key: string, action: "view" | "like" | "unlike") =>
  call({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, action }) });

function storageGet(storage: "session" | "local", name: string) {
  try {
    return (storage === "session" ? sessionStorage : localStorage).getItem(name);
  } catch {
    return null;
  }
}
function storageSet(storage: "session" | "local", name: string, value: string | null) {
  try {
    const s = storage === "session" ? sessionStorage : localStorage;
    if (value === null) s.removeItem(name);
    else s.setItem(name, value);
  } catch {
    // 無痕模式等無法儲存時略過
  }
}

// 同一頁面內多個元件同時呼叫時共用同一個請求
const pending = new Map<string, Promise<Stats | null>>();

/** 記錄一次瀏覽（本次造訪已記過就只讀取），回傳最新計數；資料庫無法使用時回傳 null */
export function recordView(key: string): Promise<Stats | null> {
  let p = pending.get(key);
  if (!p) {
    const flag = `fulian-viewed:${key}`;
    p = storageGet("session", flag)
      ? call(undefined, key)
      : post(key, "view").then((stats) => {
          if (stats) storageSet("session", flag, "1");
          return stats;
        });
    pending.set(key, p);
  }
  return p;
}

const likedFlag = (key: string) => `fulian-liked:${key}`;

export const hasLiked = (key: string) => storageGet("local", likedFlag(key)) === "1";

/** 按下或收回喜歡，回傳最新計數 */
export async function toggleLike(key: string, like: boolean): Promise<Stats | null> {
  const stats = await post(key, like ? "like" : "unlike");
  if (stats) storageSet("local", likedFlag(key), like ? "1" : null);
  return stats;
}

export const formatCount = (n: number) => n.toLocaleString("zh-TW");
