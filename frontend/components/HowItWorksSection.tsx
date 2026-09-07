"use client";

import { useInView } from "@/hooks/useInView";

const STEPS = [
  { num: "01", title: "Connect", desc: "Link your live Postgres or MySQL database in under a minute." },
  { num: "02", title: "Ask", desc: "Type a question in plain English — or any language you speak." },
  { num: "03", title: "Understand", desc: "Get validated SQL and real results, instantly, no report-writing." },
];

export default function HowItWorksSection() {
  return (
    <section id="features" className="relative bg-void px-6 py-24 sm:px-12">
      <div className="mx-auto max-w-5xl">
        <p className="mb-14 text-center font-mono text-xs uppercase tracking-[0.3em] text-teal">
          How it works
        </p>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STEPS.map((step, i) => {
            const { ref, inView } = useInView(0.3);
            return (
              <div
                key={step.num}
                ref={ref}
                className={`rounded-2xl border border-wire bg-slate/40 p-8 transition-all duration-700 ${
                  inView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <span className="font-display text-4xl font-bold text-teal/40">{step.num}</span>
                <p className="mt-4 font-display text-xl font-semibold text-paper">{step.title}</p>
                <p className="mt-2 text-fog">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
