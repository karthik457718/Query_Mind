import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
}

export default function Card({ children, interactive = false, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-wire bg-slate/60 transition-all duration-200 ease-[var(--ease-out)] ${
        interactive ? "cursor-pointer hover:-translate-y-0.5 hover:border-teal/50 hover:bg-slate" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
