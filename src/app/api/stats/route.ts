import type { NextRequest } from "next/server";
import { issues } from "@/data/issues";
import { addLike, addView, getStats, statsAvailable } from "@/lib/stats";

// 計數對象：site（整個網站）或某一期月刊的 id；只接受已知的對象，避免被灌入任意資料
const SITE = "site";
const isValidKey = (key: unknown): key is string =>
  typeof key === "string" && (key === SITE || issues.some((i) => i.id === key));

const unavailable = () => Response.json({ error: "stats unavailable" }, { status: 503 });
const badRequest = () => Response.json({ error: "bad request" }, { status: 400 });

// 讀取計數：GET /api/stats?key=2026-11-001
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (!isValidKey(key)) return badRequest();
  if (!statsAvailable) return unavailable();
  return Response.json(await getStats(key));
}

// 增加計數：POST /api/stats { key, action: "view" | "like" | "unlike" }
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { key?: unknown; action?: unknown } | null;
  const key = body?.key;
  const action = body?.action;
  if (!isValidKey(key)) return badRequest();
  if (!statsAvailable) return unavailable();

  if (action === "view") return Response.json(await addView(key));
  // 喜歡只開放給月刊，不開放給整個網站
  if (key !== SITE && action === "like") return Response.json(await addLike(key, 1));
  if (key !== SITE && action === "unlike") return Response.json(await addLike(key, -1));
  return badRequest();
}
