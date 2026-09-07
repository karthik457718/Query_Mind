"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="font-mono text-xs uppercase tracking-wide text-fog">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full rounded-lg border bg-void px-4 py-2.5 text-paper placeholder:text-fog transition-all duration-150 ease-[var(--ease-out)] focus:outline-none focus:ring-4 ${
            error
              ? "border-[#FF6B6B]/50 focus:border-[#FF6B6B] focus:ring-[#FF6B6B]/10"
              : "border-wire focus:border-teal focus:ring-teal/10"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-[#FF9B9B]">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
export default Input;
