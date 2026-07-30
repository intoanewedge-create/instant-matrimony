import { env } from "./env";

export const authConfig = {
  secret: env.AUTH_SECRET,
  sessionMaxAge: 30 * 24 * 60 * 60, // 30 days
};
