"use server";

import { rbacService } from "../services/rbac.service";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { verifyActionPermission } from "./action-utils";
import { returnFailure } from "../result";

export async function getRolePermissionsAction(role: Role) {
  const permCheck = await verifyActionPermission("MANAGE_PERMISSIONS");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  return await rbacService.getRolePermissions(role);
}

export async function assignPermissionAction(role: Role, permissionCode: string) {
  const permCheck = await verifyActionPermission("MANAGE_PERMISSIONS");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }

  const res = await rbacService.assignPermissionToRole(role, permissionCode);
  if (res.success) {
    revalidatePath("/admin/rbac");
  }
  return res;
}

export async function removePermissionAction(role: Role, permissionCode: string) {
  const permCheck = await verifyActionPermission("MANAGE_PERMISSIONS");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }

  const res = await rbacService.removePermissionFromRole(role, permissionCode);
  if (res.success) {
    revalidatePath("/admin/rbac");
  }
  return res;
}
