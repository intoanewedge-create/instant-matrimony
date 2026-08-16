"use server";

import { registerSchema } from "../validators/auth.validator";
import { container } from "../container";
import { AuthMapper } from "../mappers/auth.mapper";
import { revalidatePath } from "next/cache";

import { generateCaptchaChallenge, verifyCaptchaCode } from "../utils/captcha";

export async function getCaptchaAction() {
  const challenge = generateCaptchaChallenge();
  return { success: true, token: challenge.token, svgDataUri: challenge.svgDataUri };
}

async function verifyCaptchaToken(token?: string): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY || process.env.RECAPTCHA_SECRET_KEY;
  const isProd = process.env.NODE_ENV === "production";

  if (!secretKey) {
    if (isProd) {
      return { success: false, error: "CAPTCHA configuration is missing on the server." };
    }
    // Development fallback if no secret key configured
    if (!token || token.trim() === "") {
      return { success: false, error: "Please complete the CAPTCHA verification." };
    }
    return { success: true };
  }

  if (!token || !token.trim()) {
    return { success: false, error: "CAPTCHA verification is required." };
  }

  try {
    const isTurnstile = !!process.env.TURNSTILE_SECRET_KEY || !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    const verifyUrl = isTurnstile
      ? "https://challenges.cloudflare.com/turnstile/v0/siteverify"
      : "https://www.google.com/recaptcha/api/siteverify";

    const bodyData = new URLSearchParams({
      secret: secretKey,
      response: token,
    });

    const res = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: bodyData.toString(),
    });

    const json = await res.json();
    if (!json.success) {
      return { success: false, error: "CAPTCHA verification failed or token expired. Please try again." };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: "Failed to verify CAPTCHA token with provider." };
  }
}

export async function registerAction(formData: any) {
  const result = registerSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  // 1. Enforce phone requirement
  if (!formData.phone || !formData.phone.trim()) {
    return { success: false, error: "Phone number is mandatory for registration." };
  }

  // 2. Human CAPTCHA verification
  if (formData.captchaCode || formData.captchaToken) {
    if (formData.captchaCode) {
      const captchaVer = verifyCaptchaCode(formData.captchaCode, formData.captchaToken);
      if (!captchaVer.valid) {
        return { success: false, error: captchaVer.reason || "CAPTCHA verification failed." };
      }
    } else {
      const captchaRes = await verifyCaptchaToken(formData.captchaToken);
      if (!captchaRes.success) {
        return { success: false, error: captchaRes.error || "CAPTCHA verification failed." };
      }
    }
  } else {
    return { success: false, error: "CAPTCHA verification is required." };
  }

  const serviceResult = await container.services.authService.register(result.data);
  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  revalidatePath("/");
  return { success: true, user: AuthMapper.toResponse(serviceResult.data) };
}

