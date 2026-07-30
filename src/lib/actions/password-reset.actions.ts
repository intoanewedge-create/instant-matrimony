"use server";

import { forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from "../validators/auth.validator";
import { container } from "../container";
import { auth } from "../auth";
import { revalidatePath } from "next/cache";

export async function forgotPasswordAction(data: any) {
  const result = forgotPasswordSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const serviceResult = await container.services.authService.forgotPassword(result.data.email);
  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  return { success: true };
}

export async function resetPasswordAction(data: any) {
  const result = resetPasswordSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { email, code, password } = result.data;
  const serviceResult = await container.services.authService.resetPassword(email, code, password);
  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  return { success: true };
}

export async function changePasswordAction(data: any) {
  const session = await auth();
  if (!session || !session.user || !(session.user as any).id) {
    return { success: false, error: "You must be logged in to change your password." };
  }

  const result = changePasswordSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { passwordOld, passwordNew } = result.data;
  const serviceResult = await container.services.authService.changePassword(
    (session.user as any).id,
    passwordOld,
    passwordNew
  );

  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  revalidatePath("/settings");
  return { success: true };
}
