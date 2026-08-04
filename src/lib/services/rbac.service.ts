import { prisma } from "../prisma";
import { Result, returnSuccess, returnFailure } from "../result";
import { Role } from "@prisma/client";

export interface PermissionDefinition {
  code: string;
  name: string;
  module: string;
  description?: string;
}

export const SYSTEM_PERMISSIONS: PermissionDefinition[] = [
  { code: "users:read", name: "Read Users", module: "Users", description: "View user accounts and details" },
  { code: "users:write", name: "Manage Users", module: "Users", description: "Create, edit, or suspend users" },
  { code: "profiles:approve", name: "Approve Profiles", module: "Profiles", description: "Approve or reject candidate profiles" },
  { code: "payments:manage", name: "Manage Payments", module: "Payments", description: "Verify, approve, or reject payments" },
  { code: "concierge:manage", name: "Manage Concierge", module: "Concierge", description: "Handle executive concierge cases" },
  { code: "cms:edit", name: "Manage CMS", module: "CMS", description: "Manage banners, FAQs, blogs, and content pages" },
  { code: "settings:edit", name: "Manage Settings", module: "Settings", description: "Configure site branding, gateways, and settings" },
  { code: "reports:view", name: "View Reports", module: "Reports", description: "View analytics reports and download exports" },
  { code: "audit:view", name: "View Audit Logs", module: "Audit", description: "Inspect system audit trails and user activity" },
  { code: "backups:manage", name: "Manage Backups", module: "System", description: "Perform and restore system backups" },
];

export class RbacService {
  async seedPermissions(): Promise<Result<void>> {
    try {
      for (const p of SYSTEM_PERMISSIONS) {
        await prisma.permission.upsert({
          where: { code: p.code },
          update: { name: p.name, module: p.module, description: p.description },
          create: { code: p.code, name: p.name, module: p.module, description: p.description },
        });
      }
      return returnSuccess(undefined);
    } catch (e: any) {
      return returnFailure(e.message, "RBAC_SEED_ERROR");
    }
  }

  async getRolePermissions(role: Role): Promise<Result<string[]>> {
    try {
      if (role === Role.SUPER_ADMIN || role === Role.ADMIN) {
        // Super Admin & Admin have all permissions
        return returnSuccess(SYSTEM_PERMISSIONS.map((p) => p.code));
      }

      const rolePerms = await prisma.rolePermission.findMany({
        where: { role },
        include: { permission: true },
      });
      const codes = rolePerms.map((rp) => rp.permission.code);
      return returnSuccess(codes);
    } catch (e: any) {
      return returnFailure(e.message, "GET_ROLE_PERMS_ERROR");
    }
  }

  async assignPermissionToRole(role: Role, permissionCode: string): Promise<Result<void>> {
    try {
      const perm = await prisma.permission.findUnique({ where: { code: permissionCode } });
      if (!perm) return returnFailure("Permission code not found", "PERM_NOT_FOUND");

      await prisma.rolePermission.upsert({
        where: { role_permissionId: { role, permissionId: perm.id } },
        update: {},
        create: { role, permissionId: perm.id },
      });
      return returnSuccess(undefined);
    } catch (e: any) {
      return returnFailure(e.message, "ASSIGN_PERM_ERROR");
    }
  }

  async removePermissionFromRole(role: Role, permissionCode: string): Promise<Result<void>> {
    try {
      const perm = await prisma.permission.findUnique({ where: { code: permissionCode } });
      if (!perm) return returnFailure("Permission code not found", "PERM_NOT_FOUND");

      await prisma.rolePermission.deleteMany({
        where: { role, permissionId: perm.id },
      });
      return returnSuccess(undefined);
    } catch (e: any) {
      return returnFailure(e.message, "REMOVE_PERM_ERROR");
    }
  }

  async hasPermission(role: Role, requiredPermission: string): Promise<boolean> {
    if (role === Role.SUPER_ADMIN || role === Role.ADMIN) return true;
    const res = await this.getRolePermissions(role);
    if (!res.success || !res.data) return false;
    return res.data.includes(requiredPermission);
  }
}

export const rbacService = new RbacService();
