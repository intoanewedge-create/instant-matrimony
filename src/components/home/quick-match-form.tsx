"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

export function QuickMatchForm() {
  const router = useRouter();
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [lookingFor, setLookingFor] = useState<"Male" | "Female">("Female");

  const handleGenderChange = (newGender: "Male" | "Female") => {
    setGender(newGender);
    if (newGender === "Male") {
      setLookingFor("Female");
    } else {
      setLookingFor("Male");
    }
  };

  const handleLookingForChange = (newLookingFor: "Male" | "Female") => {
    setLookingFor(newLookingFor);
    if (newLookingFor === "Female") {
      setGender("Male");
    } else {
      setGender("Female");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/register?gender=${encodeURIComponent(gender)}&lookingFor=${encodeURIComponent(lookingFor)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border/60 p-5 rounded-2xl shadow-xl shadow-black/5 max-w-xl">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="user-gender-select" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            I am a
          </label>
          <select
            id="user-gender-select"
            value={gender}
            onChange={(e) => handleGenderChange(e.target.value as "Male" | "Female")}
            className="w-full bg-secondary border border-border/60 rounded-lg p-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-all"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div>
          <label htmlFor="looking-for-gender-select" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Looking for a
          </label>
          <select
            id="looking-for-gender-select"
            value={lookingFor}
            onChange={(e) => handleLookingForChange(e.target.value as "Male" | "Female")}
            className="w-full bg-secondary border border-border/60 rounded-lg p-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-all"
          >
            <option value="Female">Female</option>
            <option value="Male">Male</option>
          </select>
        </div>
      </div>

      <Button type="submit" className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold py-5 text-sm rounded-xl shadow-md gap-2">
        <Sparkles className="w-4 h-4" /> Start Searching Now <ArrowRight className="w-4 h-4" />
      </Button>
    </form>
  );
}
