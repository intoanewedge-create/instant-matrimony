import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

export default function Membership() {
  const plans = [
    {
      name: "Silver",
      price: "1,499",
      duration: "30 Days",
      description: "Basic plan for profile views and initial connections.",
      features: [
        "View 15 Verified Contacts",
        "Send Unlimited Interests",
        "Direct Chat (Up to 5 profiles)",
        "Standard search placement",
        "Email support response in 48h"
      ],
      popular: false,
      ctaText: "Upgrade to Silver",
      variant: "outline" as const
    },
    {
      name: "Gold",
      price: "2,999",
      duration: "90 Days",
      description: "Extended search validity and more profile reveals.",
      features: [
        "View 40 Verified Contacts",
        "Send Unlimited Interests",
        "Direct Chat (Up to 15 profiles)",
        "Profile Highlight (7 Days)",
        "Priority search placement",
        "Email support response in 24h"
      ],
      popular: true,
      ctaText: "Choose Gold (Recommended)",
      variant: "default" as const
    },
    {
      name: "Platinum",
      price: "4,999",
      duration: "180 Days",
      description: "Premium plan for seekers looking for maximum results.",
      features: [
        "View 100 Verified Contacts",
        "Send Unlimited Interests",
        "Unlimited Direct Chat",
        "Profile Highlight (30 Days)",
        "Dedicated Relationship Advisor",
        "Assisted matchmaking matches list",
        "Priority support helpline"
      ],
      popular: false,
      ctaText: "Go Platinum",
      variant: "outline" as const
    },
    {
      name: "Diamond",
      price: "8,999",
      duration: "365 Days",
      description: "Ultimate elite plan with advisor-led match finding.",
      features: [
        "View 250 Verified Contacts",
        "Send Unlimited Interests",
        "Unlimited Direct Chat",
        "Profile Highlight (90 Days)",
        "Personal Relationship Manager",
        "Advisor-led candidate search",
        "Private profile lock options",
        "Priority support response"
      ],
      popular: false,
      ctaText: "Upgrade to Diamond",
      variant: "accent" as const
    }
  ];

  return (
    <div className="flex flex-col w-full py-16 sm:py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            SaaS Membership Plans
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-4 leading-relaxed">
            Upgrade your membership to unlock contact details, send chat requests, and gain priority visibility.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative bg-card border rounded-3xl p-8 flex flex-col justify-between shadow-sm transition-all duration-200 hover:shadow-md ${
                plan.popular
                  ? "border-primary ring-2 ring-primary/20 scale-102 z-10 md:scale-105"
                  : "border-border/60"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm shadow-primary/20">
                  Most Popular
                </span>
              )}

              <div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{plan.description}</p>
                
                {/* Price Display */}
                <div className="my-6">
                  <span className="text-3xl font-extrabold text-foreground">₹{plan.price}</span>
                  <span className="text-sm text-muted-foreground"> / {plan.duration}</span>
                </div>

                <hr className="border-border/40 my-6" />

                {/* Features List */}
                <ul className="space-y-3 text-sm">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start space-x-2.5">
                      <Check className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground text-xs leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Link href="/register">
                  <Button variant={plan.popular ? "default" : plan.variant} className="w-full">
                    {plan.ctaText}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Extra text */}
        <div className="text-center mt-16 max-w-xl mx-auto">
          <p className="text-xs text-muted-foreground leading-relaxed">
            All payments are encrypted using SSL. Transactions will appear as 'InstantMatrimony Tech' on your card statement. Need manual bank transfers? contact support@instantmatrimony.com.
          </p>
        </div>

      </div>
    </div>
  );
}
