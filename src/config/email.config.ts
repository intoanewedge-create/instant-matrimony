import { env } from "./env";

export const emailConfig = {
  provider:
    (process.env.EMAIL_PROVIDER as "mock" | "smtp" | "resend") ||
    (process.env.RESEND_API_KEY ? "resend" : "mock"),
  from: process.env.EMAIL_FROM || "InstantMatrimony <noreply@instantmatrimony.com>",
  smtp: {
    host: env.SMTP_HOST || "localhost",
    port: parseInt(env.SMTP_PORT || "587", 10),
    user: env.SMTP_USER || "",
    pass: env.SMTP_PASS || "",
  },
  resend: {
    apiKey: env.RESEND_API_KEY || "",
  },
};
