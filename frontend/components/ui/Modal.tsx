"use client";

import { ReactNode, useEffect, useState } from "react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const [closing, setClosing] = useState(false);

  function handleClose() {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 200);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) handleClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm ${
        closing ? "animate-[fade-in-up_200ms_ease-out_reverse]" : "animate-fade-in-up"
      }`}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-md rounded-3xl border border-white/10 bg-surface/90 p-7 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl ${
          closing ? "animate-[spring-in_200ms_ease-out_reverse]" : "animate-spring-in"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
          <button
            onClick={handleClose}
            className="cursor-pointer rounded-full p-1.5 text-mist transition hover:bg-white/10 hover:text-ink"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
