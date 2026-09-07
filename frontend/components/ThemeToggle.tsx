"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    // Check local storage or system preference on mount
    const saved = localStorage.getItem("theme");
    if (saved === "light" || (!saved && window.matchMedia("(prefers-color-scheme: light)").matches)) {
      setIsLight(true);
      document.documentElement.classList.add("light");
    }
  }, []);

  function toggle() {
    if (isLight) {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
      setIsLight(false);
    } else {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
      setIsLight(true);
    }
  }

  return (
    <button
      onClick={toggle}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-mist transition-colors hover:bg-white/10 hover:text-white"
      aria-label="Toggle Theme"
    >
      {isLight ? "☾" : "☼"}
    </button>
  );
}
