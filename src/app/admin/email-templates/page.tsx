"use client";

import { useEffect, useState } from "react";
import { getEmailTemplatesAction, updateEmailTemplateAction, sendTestEmailAction } from "@/lib/actions/email-template.actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

export default function AdminEmailTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getEmailTemplatesAction().then((res) => {
      if (res.success && res.data) {
        setTemplates(res.data);
        if (res.data.length > 0) {
          selectTemplate(res.data[0]);
        }
      }
      setLoading(false);
    });
  }, []);

  function selectTemplate(tpl: any) {
    setSelectedTemplate(tpl);
    setSubject(tpl.subject);
    setBodyHtml(tpl.bodyHtml);
    setBodyText(tpl.bodyText);
  }

  const handleSave = async () => {
    if (!selectedTemplate) return;
    setSaving(true);
    const res = await updateEmailTemplateAction(selectedTemplate.id, subject, bodyHtml, bodyText);
    setSaving(false);
    if (res.success) {
      toast({ title: "Template Saved", description: `Updated ${selectedTemplate.name} (v${res.data.version}).` });
      setTemplates((prev) => prev.map((t) => (t.id === selectedTemplate.id ? res.data : t)));
      setSelectedTemplate(res.data);
    } else {
      toast({ title: "Error", description: res.error, type: "error" });
    }
  };

  const handleSendTest = async () => {
    if (!selectedTemplate || !testEmail) return;
    const res = await sendTestEmailAction(selectedTemplate.slug, testEmail);
    if (res.success) {
      toast({ title: "Test Email Sent", description: `Delivered test template to ${testEmail}` });
    } else {
      toast({ title: "Failed", description: res.error, type: "error" });
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading email templates...</div>;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Template Builder</h1>
        <p className="text-muted-foreground">Edit system notification emails with dynamic variable tags and live preview.</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Templates ({templates.length})</CardTitle>
            <CardDescription>Select a template to customize.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => selectTemplate(tpl)}
                className={`w-full text-left p-3 rounded-md border text-sm transition-colors ${
                  selectedTemplate?.id === tpl.id ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted"
                }`}
              >
                <div>{tpl.name}</div>
                <div className="text-xs opacity-75 font-mono">{tpl.slug}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        {selectedTemplate && (
          <Card className="col-span-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{selectedTemplate.name}</CardTitle>
                <CardDescription>Version: v{selectedTemplate.version} | Slug: {selectedTemplate.slug}</CardDescription>
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Template"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Subject Line</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>

              <div>
                <Label>Supported Placeholders</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedTemplate.placeholders?.map((p: string) => (
                    <span key={p} className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs font-mono">
                      {"{{" + p + "}}"}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <Label>HTML Body</Label>
                <Textarea rows={8} className="font-mono text-xs" value={bodyHtml} onChange={(e) => setBodyHtml(e.target.value)} />
              </div>

              <div>
                <Label>Plain Text Body</Label>
                <Textarea rows={4} className="font-mono text-xs" value={bodyText} onChange={(e) => setBodyText(e.target.value)} />
              </div>

              <div className="border-t pt-4 flex gap-3 items-end">
                <div className="flex-1">
                  <Label>Send Test Email</Label>
                  <Input placeholder="admin@example.com" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} />
                </div>
                <Button variant="outline" onClick={handleSendTest}>Send Test</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
