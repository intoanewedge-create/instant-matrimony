import { auth } from "../auth";
import { permissionService } from "../services/permission.service";
import { AdminPermission, AdminRole } from "../domain/admin-contracts";
import { returnFailure, Result, returnSuccess } from "../result";
import { Role } from "@prisma/client";

export async function verifyActionPermission(
  permission?: AdminPermission
): Promise<Result<{ userId: string; role: Role }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return returnFailure("Unauthorized: Not logged in", "UNAUTHORIZED");
  }

  const role = (session.user as any).role as Role;

  if (permission) {
    const hasPerm = permissionService.hasPermission(role as unknown as AdminRole, permission);
    if (!hasPerm) {
      return returnFailure(`Forbidden: Required permission ${permission}`, "FORBIDDEN");
    }
  }

  return returnSuccess({
    userId: session.user.id,
    role,
  });
}
