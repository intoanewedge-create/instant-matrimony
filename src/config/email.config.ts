import { env } from "./env";

export type EmailProviderType = "mock" | "smtp" | "resend";

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}

export interface ResendConfig {
  apiKey: string;
}

export interface EmailConfiguration {
  provider: EmailProviderType;
  from: string;
  smtp: SmtpConfig;
  resend: ResendConfig;
}

export function getEmailConfig(): EmailConfiguration {
  const explicitProvider = process.env.EMAIL_PROVIDER as EmailProviderType | undefined;

  let provider: EmailProviderType = "mock";
  if (explicitProvider && ["mock", "smtp", "resend"].includes(explicitProvider)) {
    provider = explicitProvider;
  } else if (process.env.RESEND_API_KEY || env.RESEND_API_KEY) {
    provider = "resend";
  } else if (process.env.SMTP_HOST || process.env.EMAIL_SERVER_HOST || env.SMTP_HOST) {
    provider = "smtp";
  }

  const from =
    process.env.EMAIL_FROM ||
    process.env.SMTP_FROM ||
    process.env.MAIL_FROM ||
    "InstantMatrimony <noreply@instantmatrimony.com>";

  const smtpPort = parseInt(
    process.env.SMTP_PORT ||
      process.env.EMAIL_SERVER_PORT ||
      env.SMTP_PORT ||
      "587",
    10
  );

  const smtpSecure =
    process.env.SMTP_SECURE === "true" ||
    smtpPort === 465;

  const smtpHost =
    process.env.SMTP_HOST ||
    process.env.EMAIL_SERVER_HOST ||
    env.SMTP_HOST ||
    "localhost";

  const smtpUser =
    process.env.SMTP_USER ||
    process.env.EMAIL_SERVER_USER ||
    env.SMTP_USER ||
    "";

  const smtpPass =
    process.env.SMTP_PASS ||
    process.env.SMTP_PASSWORD ||
    process.env.EMAIL_SERVER_PASSWORD ||
    env.SMTP_PASS ||
    "";

  const resendApiKey =
    process.env.RESEND_API_KEY ||
    env.RESEND_API_KEY ||
    "";

  return {
    provider,
    from,
    smtp: {
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      user: smtpUser,
      pass: smtpPass,
    },
    resend: {
      apiKey: resendApiKey,
    },
  };
}

/**
 * Proxy object that always provides the latest runtime email configuration.
 */
export const emailConfig: EmailConfiguration = {
  get provider() {
    return getEmailConfig().provider;
  },
  get from() {
    return getEmailConfig().from;
  },
  get smtp() {
    return getEmailConfig().smtp;
  },
  get resend() {
    return getEmailConfig().resend;
  },
};
