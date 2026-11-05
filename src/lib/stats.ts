import "server-only";
import { Redis } from "@upstash/redis";

// 瀏覽次數與喜歡次數的儲存層
// 正式環境：Upstash Redis（在 Vercel 後台 Storage 串接後會自動提供 KV_REST_API_URL / KV_REST_API_TOKEN）
// 本機開發且沒有設定時：存在記憶體裡，重開伺服器就歸零，只供開發測試

export type Stats = { views: number; likes: number };

type Store = {
  get(keys: string[]): Promise<number[]>;
  incr(key: string, by: number): Promise<number>;
  set(key: string, value: number): Promise<void>;
};

const hasRedisEnv =
  !!(process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL) &&
  !!(process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN);

function redisStore(): Store {
  const redis = Redis.fromEnv();
  return {
    async get(keys) {
      const values = await redis.mget<(number | null)[]>(...keys);
      return values.map((v) => Number(v ?? 0));
    },
    incr: (key, by) => redis.incrby(key, by),
    async set(key, value) {
      await redis.set(key, value);
    },
  };
}

function memoryStore(): Store {
  const g = globalThis as unknown as { __fulianStats?: Map<string, number> };
  const map = (g.__fulianStats ??= new Map());
  return {
    async get(keys) {
      return keys.map((k) => map.get(k) ?? 0);
    },
    async incr(key, by) {
      const v = (map.get(key) ?? 0) + by;
      map.set(key, v);
      return v;
    },
    async set(key, value) {
      map.set(key, value);
    },
  };
}

/** 正式環境沒串接資料庫時為 null，前端會把計數隱藏起來 */
const store: Store | null = hasRedisEnv
  ? redisStore()
  : process.env.NODE_ENV !== "production"
    ? memoryStore()
    : null;

export const statsAvailable = store !== null;

const viewsKey = (key: string) => `fulian:views:${key}`;
const likesKey = (key: string) => `fulian:likes:${key}`;

export async function getStats(key: string): Promise<Stats> {
  const [views, likes] = await store!.get([viewsKey(key), likesKey(key)]);
  return { views, likes };
}

export async function addView(key: string): Promise<Stats> {
  await store!.incr(viewsKey(key), 1);
  return getStats(key);
}

export async function addLike(key: string, delta: 1 | -1): Promise<Stats> {
  const likes = await store!.incr(likesKey(key), delta);
  // 避免收回喜歡時變成負數
  if (likes < 0) await store!.set(likesKey(key), 0);
  return getStats(key);
}
