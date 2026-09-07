"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-gold to-violet text-graphite font-bold shadow-[0_15px_40px_-12px_rgba(139,92,246,0.5)] hover:-translate-y-0.5",
  secondary:
    "border border-white/10 bg-white/5 text-ink backdrop-blur-md hover:bg-white/10",
  ghost: "text-mist hover:text-ink hover:bg-white/5",
  danger: "bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20",
};

export default function Button({
  variant = "primary",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-2xl px-5 py-3 text-sm transition-all duration-200 ease-[var(--ease-out)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 disabled:hover:translate-y-0 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
      )}
      {children}
    </button>
  );
}
