"use client";

import { useState } from "react";
import { useInView } from "@/hooks/useInView";

const FAQS = [
  { q: "What databases can I connect?", a: "PostgreSQL and MySQL today, with more engines planned." },
  { q: "Is my data stored on your servers?", a: "No. Only encrypted connection credentials are stored — your actual data is queried live and never copied." },
  { q: "Can I ask questions in my own language?", a: "Yes — the natural-language layer understands questions in any language and translates intent into correct SQL." },
  { q: "Can generated SQL modify my data?", a: "No. Every query is validated to be SELECT-only before it ever runs, with destructive operations blocked in code." },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  const { ref, inView } = useInView(0.2);

  return (
    <section
      ref={ref}
      className={`bg-void px-6 py-24 transition-all duration-700 sm:px-12 ${
        inView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
    >
      <div className="mx-auto max-w-2xl">
        <p className="mb-10 text-center font-mono text-xs uppercase tracking-[0.3em] text-teal">
          Frequently asked
        </p>
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-wire bg-slate/40">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-medium text-paper">{faq.q}</span>
                <span
                  className={`text-teal transition-transform duration-300 ${
                    open === i ? "rotate-45" : "rotate-0"
                  }`}
                >
                  +
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ${
                  open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden px-5 pb-4 text-fog">{faq.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
