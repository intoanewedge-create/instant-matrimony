"use server";

import { registerSchema } from "../validators/auth.validator";
import { container } from "../container";
import { AuthMapper } from "../mappers/auth.mapper";
import { revalidatePath } from "next/cache";

export async function registerAction(formData: any) {
  const result = registerSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const serviceResult = await container.services.authService.register(result.data);
  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  revalidatePath("/");
  return { success: true, user: AuthMapper.toResponse(serviceResult.data) };
}
