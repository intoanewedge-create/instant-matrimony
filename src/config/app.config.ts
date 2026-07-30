import { env } from "./env";

export const appConfig = {
  env: env.NODE_ENV,
  url: env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  name: "InstantMatrimony",
};
