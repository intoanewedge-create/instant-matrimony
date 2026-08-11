import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Mail, Phone, Clock } from "lucide-react";
import { container } from "@/lib/container";
import { CmsPageRenderer } from "@/components/cms-page-renderer";
import { websiteSettingsService, DEFAULT_BRANDING_SETTINGS } from "@/lib/services/website-settings.service";

export default async function Contact() {
  let cmsData = null;
  try {
    const cmsRes = await container.services.cmsService.getPageBySlug("contact");
    if (cmsRes.success && cmsRes.data && cmsRes.data.status === "PUBLISHED") {
      cmsData = cmsRes.data;
    }
  } catch {
    // Fallback to static
  }

  if (cmsData) {
    return (
      <CmsPageRenderer
        title={cmsData.title}
        content={cmsData.content}
        seoTitle={cmsData.seoTitle}
      />
    );
  }

  const settingsRes = await websiteSettingsService.getSettings().catch(() => null);
  const settings = (settingsRes && settingsRes.success && settingsRes.data) ? settingsRes.data : DEFAULT_BRANDING_SETTINGS;

  return (
    <div className="flex flex-col w-full py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Get In Touch
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-4 leading-relaxed">
            Have questions or need assistance? Our customer relationship team is here to assist you.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Support Details (Col 5) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-card border border-border/40 p-6 rounded-2xl space-y-6 shadow-sm">
              <h2 className="text-xl font-bold">Contact Info</h2>
              
              <div className="flex items-start space-x-3.5 text-sm">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">Phone / WhatsApp</p>
                  <p className="text-muted-foreground mt-1">{settings.contactNumber}</p>
                  <p className="text-muted-foreground text-xs">(WhatsApp Support Available)</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 text-sm">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">Support Email</p>
                  <p className="text-muted-foreground mt-1">{settings.emailAddress}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 text-sm">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">Business / Contact Details</p>
                  <p className="text-foreground font-medium mt-1">
                    {settings.companyName}
                  </p>
                  <p className="text-muted-foreground">
                    {settings.officeAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 text-sm border-t border-border/20 pt-4">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">Office Hours</p>
                  <p className="text-muted-foreground mt-1">Mon - Sat: 9:00 AM to 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form (Col 7) */}
          <div className="lg:col-span-7">
            <form className="bg-card border border-border/40 p-8 rounded-2xl space-y-5 shadow-sm">
              <h2 className="text-xl font-bold">Send a Message</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Fill in the form below and a representative will contact you via email or phone within 2 hours.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+91 99999 99999" required />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="john@example.com" required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message">Message / Queries</Label>
                <Textarea id="message" placeholder="Describe your query here..." required />
              </div>

              <Button type="submit" variant="accent" className="w-full">
                Submit Message
              </Button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
