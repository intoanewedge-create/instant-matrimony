"use client";

import { useEffect, useState } from "react";
import { getSettingsAction } from "@/lib/actions/settings.actions";

export function ThemeStyleInjector() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    getSettingsAction().then((res) => {
      if (res.success && res.data) {
        setSettings(res.data);
      }
    });
  }, []);

  if (!settings) return null;

  return (
    <style jsx global>{`
      :root {
        --primary: ${settings.primaryColor || "#e11d48"};
        --secondary: ${settings.secondaryColor || "#4f46e5"};
        --radius: ${settings.borderRadius || "0.5rem"};
        --font-sans: ${settings.fontFamily || "Inter, sans-serif"};
      }
    `}</style>
  );
}
