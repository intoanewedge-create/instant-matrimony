import { auth } from "../auth";
import { container } from "../container";
import { permissionService } from "../services/permission.service";
import { redirect } from "next/navigation";
import { prisma } from "../prisma";

export async function verifyAdminAccess(permission: string, moduleName?: string) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.role === "USER") {
    redirect("/login");
  }

  // 1. RBAC Check
  const hasPerm = permissionService.hasPermission(user.role as any, permission as any);
  if (!hasPerm) {
    redirect("/unauthorized");
  }

  // 2. Feature Flag Check
  if (moduleName) {
    const flagRes = await container.services.featureFlagService.isEnabled(moduleName.toLowerCase(), true);
    if (flagRes.success && flagRes.data === false) {
      // Module disabled by feature flag
      redirect("/admin/disabled?module=" + encodeURIComponent(moduleName));
    }
  }

  return user;
}
