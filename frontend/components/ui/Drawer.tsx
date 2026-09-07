"use client";

import { ReactNode } from "react";

export default function Drawer({
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="animate-fade-in-up absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md translate-x-0 flex-col border-l border-white/10 bg-surface/95 p-7 shadow-[-30px_0_80px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl animate-spring-in">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full p-1.5 text-mist transition hover:bg-white/10 hover:text-ink"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
