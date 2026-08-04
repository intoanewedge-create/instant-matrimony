"use client";

import { useEffect, useState } from "react";
import { getRolePermissionsAction, assignPermissionAction, removePermissionAction } from "@/lib/actions/rbac.actions";
import { SYSTEM_PERMISSIONS } from "@/lib/services/rbac.service";
import { Role } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

export default function AdminRbacPage() {
  const [selectedRole, setSelectedRole] = useState<Role>(Role.PROFILE_MODERATOR);
  const [activePermissions, setActivePermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadRolePermissions = (role: Role) => {
    setLoading(true);
    getRolePermissionsAction(role).then((res) => {
      if (res.success && Array.isArray(res.data)) {
        setActivePermissions(res.data);
      } else {
        setActivePermissions([]);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadRolePermissions(selectedRole);
  }, [selectedRole]);

  const handleToggle = async (permCode: string, isChecked: boolean) => {
    if (isChecked) {
      const res = await assignPermissionAction(selectedRole, permCode);
      if (res.success) {
        setActivePermissions((prev) => [...prev, permCode]);
        toast({ title: "Permission Assigned", description: `Granted ${permCode} to ${selectedRole}` });
      }
    } else {
      const res = await removePermissionAction(selectedRole, permCode);
      if (res.success) {
        setActivePermissions((prev) => prev.filter((p) => p !== permCode));
        toast({ title: "Permission Revoked", description: `Removed ${permCode} from ${selectedRole}` });
      }
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Role-Based Access Control (RBAC)</h1>
        <p className="text-muted-foreground">Assign dynamic permissions to system roles.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Role to Edit Permissions</CardTitle>
          <CardDescription>Choose a role from the dropdown below to configure granular feature permissions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="w-72">
            <Label>System Role</Label>
            <Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as Role)}>
              <option value={Role.SUPER_ADMIN}>SUPER_ADMIN (Full Access)</option>
              <option value={Role.ADMIN}>ADMIN</option>
              <option value={Role.PROFILE_MODERATOR}>PROFILE_MODERATOR</option>
              <option value={Role.PAYMENT_MANAGER}>PAYMENT_MANAGER</option>
              <option value={Role.CONCIERGE_MANAGER}>CONCIERGE_MANAGER</option>
              <option value={Role.CONTENT_MANAGER}>CONTENT_MANAGER</option>
              <option value={Role.CUSTOMER_SUPPORT}>CUSTOMER_SUPPORT</option>
              <option value={Role.REPORT_VIEWER}>REPORT_VIEWER</option>
            </Select>
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-lg">Granular Permissions Matrix</h3>
            {loading ? (
              <p className="text-muted-foreground">Loading permissions...</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {SYSTEM_PERMISSIONS.map((perm) => {
                  const isChecked = activePermissions.includes(perm.code);
                  const isSuperAdmin = selectedRole === Role.SUPER_ADMIN || selectedRole === Role.ADMIN;
                  return (
                    <div key={perm.code} className="flex items-start space-x-3 p-3 border rounded-md">
                      <Checkbox
                        id={perm.code}
                        checked={isChecked}
                        disabled={isSuperAdmin}
                        onChange={(e) => handleToggle(perm.code, e.target.checked)}
                      />
                      <div className="space-y-1 leading-none">
                        <label htmlFor={perm.code} className="text-sm font-medium leading-none cursor-pointer">
                          {perm.name} <span className="text-xs text-muted-foreground">({perm.code})</span>
                        </label>
                        <p className="text-xs text-muted-foreground">{perm.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

