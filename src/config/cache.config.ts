import { env } from "./env";

export const cacheConfig = {
  provider: env.CACHE_PROVIDER,
  defaultTtl: 300, // 5 minutes
};
