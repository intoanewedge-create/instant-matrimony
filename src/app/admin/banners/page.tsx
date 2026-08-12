import { prisma } from "@/lib/prisma";
import { AdminBannersClient } from "./admin-banners-client";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return <AdminBannersClient initialBanners={JSON.parse(JSON.stringify(banners))} />;
  } catch (error) {
    console.error("AdminBannersPage error loading from database:", error);
    return <AdminBannersClient initialBanners={[]} />;
  }
}
