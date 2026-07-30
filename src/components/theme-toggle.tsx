"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className={`w-9 h-9 rounded-xl ${className}`} aria-label="Toggle theme">
        <Sun className="w-4 h-4 text-slate-400" />
      </Button>
    );
  }

  const toggleTheme = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme("dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={`w-9 h-9 rounded-xl transition-all duration-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/60 ${className}`}
      title={`Current theme: ${theme}. Click to switch.`}
      aria-label="Toggle light and dark mode"
    >
      {theme === "dark" ? (
        <Moon className="w-4.5 h-4.5 text-indigo-400 animate-in spin-in-90 duration-300" />
      ) : theme === "light" ? (
        <Sun className="w-4.5 h-4.5 text-amber-500 animate-in spin-in-90 duration-300" />
      ) : (
        <Laptop className="w-4.5 h-4.5 text-rose-500 animate-in spin-in-90 duration-300" />
      )}
    </Button>
  );
}
