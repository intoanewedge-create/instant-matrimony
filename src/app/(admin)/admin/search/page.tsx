import React from "react";
import { verifyAdminAccess } from "@/lib/actions/admin-guard";
import { prisma } from "@/lib/prisma";
import { AdminCard, AdminPageHeader } from "@/components/admin/design-system";
import { Search, User, Megaphone, FileCode, ShieldAlert, History } from "lucide-react";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function GlobalSearchPage({ searchParams }: SearchPageProps) {
  // 1. RBAC Guard check
  await verifyAdminAccess("VIEW_ANALYTICS");

  const params = await searchParams;
  const q = params.q || "";

  // 2. Query all tables concurrently if search term exists
  let users: any[] = [];
  let campaigns: any[] = [];
  let cmsPages: any[] = [];
  let fraudCases: any[] = [];
  let auditLogs: any[] = [];

  if (q) {
    const term = q.trim();
    const [usersRes, campaignsRes, cmsRes, fraudRes, auditRes] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { email: { contains: term, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
      prisma.campaign.findMany({
        where: {
          name: { contains: term, mode: "insensitive" },
        },
        take: 5,
      }),
      prisma.cmsPage.findMany({
        where: {
          OR: [
            { title: { contains: term, mode: "insensitive" } },
            { slug: { contains: term, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
      prisma.fraudCase.findMany({
        where: {
          OR: [
            { reasons: { contains: term, mode: "insensitive" } },
            { user: { email: { contains: term, mode: "insensitive" } } },
          ],
        },
        include: { user: true },
        take: 5,
      }),
      prisma.auditLog.findMany({
        where: {
          OR: [
            { action: { contains: term, mode: "insensitive" } },
            { details: { contains: term, mode: "insensitive" } },
          ],
        },
        include: { user: true },
        take: 5,
      }),
    ]);

    users = usersRes;
    campaigns = campaignsRes;
    cmsPages = cmsRes;
    fraudCases = fraudRes;
    auditLogs = auditRes;
  }

  const hasResults =
    users.length > 0 ||
    campaigns.length > 0 ||
    cmsPages.length > 0 ||
    fraudCases.length > 0 ||
    auditLogs.length > 0;

  return (
    <main id="admin-main-content" className="p-6 space-y-6 max-w-5xl mx-auto select-none">
      <AdminPageHeader
        title="Global Portal Search"
        description="Search across users, campaigns, CMS pages, moderation actions, fraud logs, and security timelines in real time."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Search" }
        ]}
      />

      {/* Global Search Box */}
      <AdminCard>
        <form method="GET" action="/admin/search" className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search users, campaigns, articles, logs..."
              className="w-full pl-10 pr-4 py-3 bg-muted/40 border border-border/60 rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/80 transition-all select-text"
              aria-label="Unified global search input"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Search
          </button>
        </form>
      </AdminCard>

      {/* Search Results Display */}
      {q && (
        <div className="space-y-6 animate-fade-in">
          {!hasResults ? (
            <div className="p-12 text-center border border-dashed border-border/60 rounded-xl bg-card">
              <p className="text-sm font-semibold text-muted-foreground">
                No matching indexes found for &ldquo;{q}&rdquo;. Try using other keywords.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Users Results */}
              {users.length > 0 && (
                <AdminCard title="Matching Users" actions={<User className="h-4 w-4 text-muted-foreground" />}>
                  <div className="divide-y divide-border/20 text-xs font-semibold text-muted-foreground select-text">
                    {users.map((u) => (
                      <div key={u.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                        <div>
                          <p className="font-bold text-foreground">{u.name || "Unnamed"}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{u.email}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-muted text-[10px] uppercase font-bold tracking-wider">
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </AdminCard>
              )}

              {/* Campaigns Results */}
              {campaigns.length > 0 && (
                <AdminCard title="Matching Marketing Campaigns" actions={<Megaphone className="h-4 w-4 text-muted-foreground" />}>
                  <div className="divide-y divide-border/20 text-xs font-semibold text-muted-foreground select-text">
                    {campaigns.map((c) => (
                      <div key={c.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                        <div>
                          <p className="font-bold text-foreground">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Channel: {c.type}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-wider">
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </AdminCard>
              )}

              {/* CMS Pages Results */}
              {cmsPages.length > 0 && (
                <AdminCard title="Matching CMS Pages" actions={<FileCode className="h-4 w-4 text-muted-foreground" />}>
                  <div className="divide-y divide-border/20 text-xs font-semibold text-muted-foreground select-text">
                    {cmsPages.map((p) => (
                      <div key={p.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                        <div>
                          <p className="font-bold text-foreground">{p.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Slug: /{p.slug}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] uppercase font-bold tracking-wider">
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </AdminCard>
              )}

              {/* Fraud Cases Results */}
              {fraudCases.length > 0 && (
                <AdminCard title="Matching Fraud Cases" actions={<ShieldAlert className="h-4 w-4 text-muted-foreground" />}>
                  <div className="divide-y divide-border/20 text-xs font-semibold text-muted-foreground select-text">
                    {fraudCases.map((f) => (
                      <div key={f.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                        <div>
                          <p className="font-bold text-foreground">User: {f.user?.email || "Unknown"}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Risks: {f.reasons}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 text-[10px] font-bold">
                          Score: {f.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </AdminCard>
              )}

              {/* Audit Logs Results */}
              {auditLogs.length > 0 && (
                <AdminCard title="Matching Audit Events" actions={<History className="h-4 w-4 text-muted-foreground" />}>
                  <div className="divide-y divide-border/20 text-xs font-semibold text-muted-foreground select-text">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground uppercase text-[10px] tracking-wider px-1.5 py-0.5 bg-muted rounded">
                            {log.action}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{log.createdAt.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-foreground font-medium">{log.details}</p>
                        <p className="text-[9px] text-muted-foreground">Operator: {log.user?.email || "System Engine"}</p>
                      </div>
                    ))}
                  </div>
                </AdminCard>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
