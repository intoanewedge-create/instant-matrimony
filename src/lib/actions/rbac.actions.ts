"use server";

import { rbacService } from "../services/rbac.service";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getRolePermissionsAction(role: Role) {
  return await rbacService.getRolePermissions(role);
}

export async function assignPermissionAction(role: Role, permissionCode: string) {
  const res = await rbacService.assignPermissionToRole(role, permissionCode);
  if (res.success) {
    revalidatePath("/admin/rbac");
  }
  return res;
}

export async function removePermissionAction(role: Role, permissionCode: string) {
  const res = await rbacService.removePermissionFromRole(role, permissionCode);
  if (res.success) {
    revalidatePath("/admin/rbac");
  }
  return res;
}
