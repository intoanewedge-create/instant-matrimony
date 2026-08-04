"use client";

import { useEffect, useState } from "react";
import { getNotificationSettingsAction, updateNotificationEventAction } from "@/lib/actions/notification-center.actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";

export default function AdminNotificationsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    getNotificationSettingsAction().then((res) => {
      if (res.success && res.data) setEvents(res.data);
      setLoading(false);
    });
  }, []);

  const handleToggle = async (eventKey: string, channel: string, currentVal: boolean) => {
    const updated = { [channel]: !currentVal };
    const res = await updateNotificationEventAction(eventKey, updated);
    if (res.success) {
      setEvents((prev) => prev.map((ev) => (ev.eventKey === eventKey ? { ...ev, ...updated } : ev)));
      toast({ title: "Channel Setting Saved", description: `Updated ${eventKey} notification channels.` });
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading notification center...</div>;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notification Center Matrix</h1>
        <p className="text-muted-foreground">Individually toggle Email, SMS, WhatsApp, Push, and In-App channels for every event.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Channel Matrix</CardTitle>
          <CardDescription>Select which channels should be triggered for each system event.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground font-semibold border-b">
                <tr>
                  <th className="p-4">Event Name & Description</th>
                  <th className="p-4 text-center">Email</th>
                  <th className="p-4 text-center">SMS</th>
                  <th className="p-4 text-center">WhatsApp</th>
                  <th className="p-4 text-center">Push</th>
                  <th className="p-4 text-center">In-App</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {events.map((ev) => (
                  <tr key={ev.eventKey} className="hover:bg-muted/30">
                    <td className="p-4">
                      <div className="font-medium">{ev.eventName}</div>
                      <div className="text-xs text-muted-foreground">{ev.description}</div>
                    </td>
                    <td className="p-4 text-center">
                      <Checkbox checked={ev.emailEnabled} onChange={() => handleToggle(ev.eventKey, "emailEnabled", ev.emailEnabled)} />
                    </td>
                    <td className="p-4 text-center">
                      <Checkbox checked={ev.smsEnabled} onChange={() => handleToggle(ev.eventKey, "smsEnabled", ev.smsEnabled)} />
                    </td>
                    <td className="p-4 text-center">
                      <Checkbox checked={ev.whatsappEnabled} onChange={() => handleToggle(ev.eventKey, "whatsappEnabled", ev.whatsappEnabled)} />
                    </td>
                    <td className="p-4 text-center">
                      <Checkbox checked={ev.pushEnabled} onChange={() => handleToggle(ev.eventKey, "pushEnabled", ev.pushEnabled)} />
                    </td>
                    <td className="p-4 text-center">
                      <Checkbox checked={ev.inAppEnabled} onChange={() => handleToggle(ev.eventKey, "inAppEnabled", ev.inAppEnabled)} />
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

