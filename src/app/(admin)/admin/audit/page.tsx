import React from "react";
import { verifyAdminAccess } from "@/lib/actions/admin-guard";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader, AdminCard } from "@/components/admin/design-system";
import { DataTable } from "@/components/admin/data-table";

interface AuditPageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
  }>;
}

export default async function AuditLogsPage({ searchParams }: AuditPageProps) {
  // 1. Guard Check
  await verifyAdminAccess("MANAGE_SYSTEM");

  // Resolve Search Params
  const params = await searchParams;
  const page = Number(params.page || 1);
  const q = params.q || "";
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  // 2. Build Query
  const where: any = {};
  if (q) {
    where.OR = [
      { action: { contains: q, mode: "insensitive" } },
      { ipAddress: { contains: q, mode: "insensitive" } },
      { details: { contains: q, mode: "insensitive" } },
      {
        user: {
          email: { contains: q, mode: "insensitive" },
        },
      },
    ];
  }

  // 3. Query Database
  const total = await prisma.auditLog.count({ where });
  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
    },
    skip,
    take: pageSize,
  });

  // 4. Map DB records to generic Table rows
  const tableData = logs.map((log) => {
    // Parse correlation/message details if saved as JSON
    let correlationId = "N/A";
    let message = log.details || "";
    let beforeVals = "";
    let afterVals = "";

    try {
      if (log.details && (log.details.startsWith("{") || log.details.startsWith("["))) {
        const parsed = JSON.parse(log.details);
        correlationId = parsed.correlationId || "N/A";
        message = parsed.message || "";
        if (parsed.previousValues) beforeVals = JSON.stringify(parsed.previousValues, null, 2);
        if (parsed.newValues) afterVals = JSON.stringify(parsed.newValues, null, 2);
      }
    } catch {
      // Keep fallback plain text message
    }

    return {
      id: log.id,
      action: log.action,
      operator: log.user?.email || "System Engine",
      role: log.user?.role || "SYSTEM",
      ipAddress: log.ipAddress || "localhost",
      correlationId,
      message,
      beforeVals,
      afterVals,
      createdAt: log.createdAt.toLocaleString(),
    };
  });

  // Define Table Columns
  const columns = [
    {
      key: "createdAt",
      label: "Timestamp",
    },
    {
      key: "action",
      label: "Action",
      render: (row: any) => (
        <span className="font-extrabold text-foreground px-2 py-0.5 rounded bg-muted/60 text-[11px] uppercase tracking-wide select-all">
          {row.action}
        </span>
      ),
    },
    {
      key: "operator",
      label: "Operator",
      render: (row: any) => (
        <div>
          <div className="font-bold text-foreground select-all">{row.operator}</div>
          <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{row.role}</div>
        </div>
      ),
    },
    {
      key: "ipAddress",
      label: "Client IP",
      render: (row: any) => <span className="font-mono text-xs select-all">{row.ipAddress}</span>,
    },
    {
      key: "correlationId",
      label: "Correlation ID",
      render: (row: any) => <span className="font-mono text-[10px] text-muted-foreground select-all">{row.correlationId}</span>,
    },
    {
      key: "message",
      label: "Details",
      render: (row: any) => (
        <div className="max-w-md space-y-1">
          <p className="text-xs text-foreground font-medium select-text">{row.message}</p>
          {(row.beforeVals || row.afterVals) && (
            <details className="cursor-pointer group">
              <summary className="text-[10px] text-primary font-bold hover:underline">
                View Payload Diffs
              </summary>
              <div className="grid grid-cols-2 gap-2 mt-2 p-2 bg-muted/40 rounded border border-border/10 font-mono text-[9px] overflow-x-auto max-h-40 select-text">
                <div>
                  <div className="text-[8px] font-bold uppercase text-muted-foreground mb-1">Before:</div>
                  <pre>{row.beforeVals || "null"}</pre>
                </div>
                <div>
                  <div className="text-[8px] font-bold uppercase text-muted-foreground mb-1">After:</div>
                  <pre>{row.afterVals || "null"}</pre>
                </div>
              </div>
            </details>
          )}
        </div>
      ),
    },
  ];

  return (
    <main id="admin-main-content" className="p-6 space-y-6 max-w-[1600px] mx-auto select-none">
      <AdminPageHeader
        title="Audit Logs & Compliance"
        description="Immutable timeline of all administrator operations, configuration adjustments, and user profile toggles."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Audit Timeline" }
        ]}
      />

      <AdminCard title="Security Logs Ledger" subtitle="Search and filter events by action, IP address, or operator email">
        {/* Render Table with Server Actions passed as Client Router pushes */}
        <DataTable
          columns={columns}
          data={tableData}
          search={{
            value: q,
            placeholder: "Search action, operator, IP...",
            onChange: () => {}, // Handled on client side or via Form navigation override
          }}
          pagination={{
            page,
            pageSize,
            total,
            onPageChange: () => {}, // Override to trigger next/navigation transitions
            onPageSizeChange: () => {},
          }}
        />
        {/* Client side bridge for interactive inputs */}
        <SearchBridge query={q} page={page} totalPages={Math.ceil(total / pageSize)} />
      </AdminCard>
    </main>
  );
}

// Inline search params navigation sync Client Component
function SearchBridge({ query, page, totalPages }: { query: string; page: number; totalPages: number }) {
  React.useEffect(() => {
    // Select inputs inside our server components table and attach event listeners to do next/navigation pushes
    const searchInput = document.querySelector('input[aria-label="Global table search"]') as HTMLInputElement;
    if (searchInput) {
      // Sync value
      searchInput.value = query;

      const handler = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          const val = encodeURIComponent(searchInput.value);
          window.location.search = `?q=${val}&page=1`;
        }
      };

      searchInput.addEventListener("keydown", handler);
      return () => searchInput.removeEventListener("keydown", handler);
    }
  }, [query]);

  // Select pagination buttons
  React.useEffect(() => {
    const buttons = document.querySelectorAll('button[aria-label]');
    buttons.forEach((btn) => {
      const label = btn.getAttribute("aria-label");
      btn.removeAttribute("disabled"); // Enable dynamically for client side navigation

      btn.addEventListener("click", () => {
        let nextPage = page;
        if (label === "First page") nextPage = 1;
        else if (label === "Previous page") nextPage = Math.max(1, page - 1);
        else if (label === "Next page") nextPage = Math.min(totalPages, page + 1);
        else if (label === "Last page") nextPage = totalPages;

        if (nextPage !== page) {
          window.location.search = `?q=${encodeURIComponent(query)}&page=${nextPage}`;
        }
      });
    });
  }, [page, query, totalPages]);

  return null;
}
