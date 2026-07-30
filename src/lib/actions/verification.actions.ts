"use server";

import { otpRequestSchema, otpVerifySchema } from "../validators/auth.validator";
import { container } from "../container";
import { revalidatePath } from "next/cache";

export async function requestOtpAction(data: any) {
  const result = otpRequestSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { target, purpose, type } = result.data;
  const serviceResult = await container.services.otpService.sendVerificationOtp(target, purpose, type);
  
  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  return { success: true };
}

export async function verifyOtpAction(data: any) {
  const result = otpVerifySchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { target, code, purpose } = result.data;
  let serviceResult;

  if (purpose === "EMAIL_VERIFICATION") {
    serviceResult = await container.services.authService.verifyEmail(target, code);
  } else if (purpose === "PHONE_VERIFICATION") {
    serviceResult = await container.services.authService.verifyPhone(target, code);
  } else {
    serviceResult = await container.services.otpService.verifyOtp(target, code, purpose);
  }

  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  revalidatePath("/");
  return { success: true };
}

export async function verifyTokenAction({ email, token }: { email: string; token: string }) {
  if (!email || !token) {
    return { success: false, error: "Missing email or verification token" };
  }

  const serviceResult = await container.services.authService.verifyEmailByToken(email, token);
  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  revalidatePath("/");
  return { success: true };
}
