"use client";

import { useEffect, useState } from "react";
import { createBackupAction, listBackupsAction, restoreBackupAction } from "@/lib/actions/backup.actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function AdminBackupsPage() {
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const loadBackups = () => {
    listBackupsAction().then((res) => {
      if (res.success && res.data) setBackups(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const handleCreateBackup = async (type: "FULL" | "CMS" | "SETTINGS") => {
    setCreating(true);
    const res = await createBackupAction(type);
    setCreating(false);
    if (res.success) {
      toast({ title: "Backup Created", description: `Generated snapshot ${res.data.fileName}` });
      loadBackups();
    } else {
      toast({ title: "Failed", description: res.error, type: "error" });
    }
  };

  const handleRestore = async (id: string) => {
    if (!confirm("Are you sure you want to restore this snapshot? Current settings will be overwritten.")) return;
    const res = await restoreBackupAction(id);
    if (res.success) {
      toast({ title: "Restore Completed", description: "Snapshot restored successfully." });
    } else {
      toast({ title: "Failed", description: res.error, type: "error" });
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading system backups...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Backup & Restoration Manager</h1>
          <p className="text-muted-foreground">Generate database snapshots, site settings, and CMS backup archives.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleCreateBackup("SETTINGS")} disabled={creating}>Settings Backup</Button>
          <Button variant="outline" onClick={() => handleCreateBackup("CMS")} disabled={creating}>CMS Backup</Button>
          <Button onClick={() => handleCreateBackup("FULL")} disabled={creating}>{creating ? "Creating..." : "Create Full Backup"}</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Snapshots ({backups.length})</CardTitle>
          <CardDescription>Download or restore previous platform snapshots.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden text-sm">
            <table className="w-full text-left">
              <thead className="bg-muted text-muted-foreground font-semibold border-b">
                <tr>
                  <th className="p-3">File Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">File Size</th>
                  <th className="p-3">Created At</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {backups.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/30">
                    <td className="p-3 font-mono font-medium">{b.fileName}</td>
                    <td className="p-3"><span className="bg-muted px-2 py-0.5 rounded text-xs">{b.backupType}</span></td>
                    <td className="p-3 font-mono">{Math.round(b.fileSize / 1024)} KB</td>
                    <td className="p-3">{new Date(b.createdAt).toLocaleString()}</td>
                    <td className="p-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => handleRestore(b.id)}>Restore Snapshot</Button>
                    </td>
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
