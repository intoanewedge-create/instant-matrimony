import { env } from "./env";

export const smsConfig = {
  provider: (process.env.SMS_PROVIDER as "mock" | "twilio") || "mock",
  twilio: {
    accountSid: env.TWILIO_ACCOUNT_SID || "",
    authToken: env.TWILIO_AUTH_TOKEN || "",
    fromNumber: env.TWILIO_FROM_NUMBER || "",
  },
};
