"use server";

import { auth } from "../auth";
import { container } from "../container";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
  step7Schema,
  step8Schema,
  step9Schema,
  step10Schema,
} from "../validators/profile.validator";
import { revalidatePath } from "next/cache";

const schemas: Record<number, any> = {
  1: step1Schema,
  2: step2Schema,
  3: step3Schema,
  4: step4Schema,
  5: step5Schema,
  6: step6Schema,
  7: step7Schema,
  8: step8Schema,
  9: step9Schema,
  10: step10Schema,
};

export async function saveStepAction(step: number, stepData: any) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }
  const userId = (session.user as any).id;

  const schema = schemas[step];
  if (!schema) {
    return { success: false, error: "Invalid step number" };
  }

  const result = schema.safeParse(stepData);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const serviceResult = await container.services.profileService.saveWizardStep(userId, step, result.data);
  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
  return { success: true };
}
