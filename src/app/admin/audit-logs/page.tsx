"use client";

import { useEffect, useState } from "react";
import { getAuditLogsAction } from "@/lib/actions/audit.actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuditLogsAction({ limit: 50 }).then((res) => {
      if (res.success && Array.isArray(res.data)) setLogs(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading audit logs...</div>;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Audit Logs</h1>
        <p className="text-muted-foreground">Detailed audit trail tracking user logins, profile approvals, payment verifications, and settings modifications.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Audit Trail ({logs.length})</CardTitle>
          <CardDescription>Records IP address, action code, module, and user details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden text-sm">
            <table className="w-full text-left">
              <thead className="bg-muted text-muted-foreground font-semibold border-b">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Module</th>
                  <th className="p-3">IP Address</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y font-mono text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30">
                    <td className="p-3 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="p-3 font-sans font-medium">{log.user?.publicId || (log.userId ? `IM${log.userId?.slice(0, 8)}` : "System")}</td>
                    <td className="p-3"><span className="bg-muted px-2 py-0.5 rounded font-semibold">{log.action}</span></td>
                    <td className="p-3">{log.module || "SYSTEM"}</td>
                    <td className="p-3">{log.ipAddress || "127.0.0.1"}</td>
                    <td className="p-3 max-w-xs truncate">{log.details || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
