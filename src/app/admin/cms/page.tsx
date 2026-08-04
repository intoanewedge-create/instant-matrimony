"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

export default function AdminCmsPage() {
  const { toast } = useToast();
  const [faqs, setFaqs] = useState([
    { question: "How does InstantMatrimony verify profiles?", answer: "We verify profiles using government photo IDs and selfie biometric matching.", category: "Verification" },
    { question: "Can I hide my photos or contact number?", answer: "Yes, you can enable photo blur or contact privacy in Privacy Settings.", category: "Privacy" }
  ]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  const handleAddFaq = () => {
    if (!newQuestion || !newAnswer) return;
    setFaqs((prev) => [...prev, { question: newQuestion, answer: newAnswer, category: "General" }]);
    setNewQuestion("");
    setNewAnswer("");
    toast({ title: "FAQ Added", description: "New FAQ published successfully." });
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dynamic CMS Manager</h1>
        <p className="text-muted-foreground">Manage homepage hero, banners, FAQs, testimonials, success stories, and blog posts.</p>
      </div>

      <Tabs defaultValue="faqs" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="banners">Hero & Banners</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="blog">Blog Articles</TabsTrigger>
        </TabsList>

        <TabsContent value="faqs">
          <Card>
            <CardHeader>
              <CardTitle>Manage FAQs</CardTitle>
              <CardDescription>Add, edit, or remove questions shown on the public FAQ page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 border p-4 rounded-lg bg-muted/20">
                <h3 className="font-semibold text-sm">Add New FAQ</h3>
                <div>
                  <Input placeholder="Question" value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} />
                </div>
                <div>
                  <Textarea placeholder="Answer" value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} />
                </div>
                <Button onClick={handleAddFaq}>Publish FAQ</Button>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Existing FAQs ({faqs.length})</h3>
                {faqs.map((faq, idx) => (
                  <div key={idx} className="border p-4 rounded-md space-y-1">
                    <p className="font-medium text-sm">{faq.question}</p>
                    <p className="text-xs text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banners">
          <Card>
            <CardHeader>
              <CardTitle>Homepage Hero & Banners</CardTitle>
              <CardDescription>Configure promotional sliders and hero section image banners.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Hero slider configurations and promotional banners are published dynamically.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials">
          <Card>
            <CardHeader>
              <CardTitle>Success Stories & Testimonials</CardTitle>
              <CardDescription>Moderate member feedback and happy couple stories.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Verified stories are highlighted on the home page and success stories page.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blog">
          <Card>
            <CardHeader>
              <CardTitle>Blog & Articles Manager</CardTitle>
              <CardDescription>Publish relationship tips, wedding guides, and news.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Articles published here appear automatically on the public /blog route.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
