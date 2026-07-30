import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Heart } from "lucide-react";

export default function SuccessStories() {
  const stories = [
    {
      names: "Aarav & Priya",
      city: "Mumbai, Maharashtra",
      date: "October 2025",
      text: "We matched through InstantMatrimony's gold plan. Aarav's verified credentials and clear family values caught my attention immediately. Within 3 months of secure messaging and meeting, our parents connected and we tied the knot. Highly recommend this platform for serious seekers!"
    },
    {
      names: "Siddharth & Ananya",
      city: "Bangalore, Karnataka",
      date: "December 2025",
      text: "Ananya and I shared a common interest in trekking and corporate product management. Finding someone with exact career alignment and cultural compatibility was difficult on typical portals. InstantMatrimony made it effortless. We're happily married now!"
    },
    {
      names: "Kabir & Sneha",
      city: "Delhi NCR",
      date: "March 2026",
      text: "My mother handled my search preferences. She was particularly impressed by the document validation badge and strict verification check. We contacted Sneha's family, and everything fell in place. Thank you InstantMatrimony!"
    }
  ];

  return (
    <div className="flex flex-col w-full py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex justify-center mb-4 text-accent">
            <Sparkles className="h-10 w-10 text-accent animate-pulse" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Success Stories
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-4 leading-relaxed">
            Read inspiring matches made on our platform. Genuine stories of compatibility, trust, and life connections.
          </p>
        </div>

        {/* Stories list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((story, idx) => (
            <Card key={idx} className="overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300">
              {/* Couple Placeholder Visual */}
              <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-6 border-b border-border/20 relative">
                <Heart className="h-12 w-12 text-primary/20 absolute" />
                <div className="flex -space-x-4">
                  <div className="h-20 w-20 rounded-full border-4 border-background bg-secondary flex items-center justify-center font-bold text-lg shadow-md uppercase">
                    {story.names.split(" & ")[0].slice(0, 1)}
                  </div>
                  <div className="h-20 w-20 rounded-full border-4 border-background bg-secondary flex items-center justify-center font-bold text-lg shadow-md uppercase">
                    {story.names.split(" & ")[1].slice(0, 1)}
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground">{story.names}</h3>
                <p className="text-xs text-muted-foreground mt-1">{story.city} • Married {story.date}</p>
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed italic">
                  "{story.text}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
}
