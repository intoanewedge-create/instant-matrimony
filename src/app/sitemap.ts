import { MetadataRoute } from "next";
import { cmsService } from "@/lib/container";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const staticRoutes = [
    "",
    "/about",
    "/contact",
    "/faq",
    "/membership",
    "/success-stories",
    "/legal",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  let dynamicRoutes: any[] = [];
  try {
    const pagesResult = await cmsService.listPages("PUBLISHED");
    if (pagesResult.success && pagesResult.data) {
      dynamicRoutes = pagesResult.data.map((page: any) => ({
        url: `${baseUrl}/pages/${page.slug}`,
        lastModified: page.updatedAt instanceof Date ? page.updatedAt.toISOString() : new Date().toISOString(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }));
    }
  } catch {
    // Degrade gracefully
  }

  return [...staticRoutes, ...dynamicRoutes];
}
