"use client";

import { useEffect, useState } from "react";

const DEMO = [
  {
    q: "who are my top 3 customers by spend?",
    sql: "SELECT name, SUM(amount) FROM orders JOIN customers\nON customer_id = id GROUP BY name ORDER BY 2 DESC LIMIT 3",
    rows: [["Ravi Kumar", "₹55,800"], ["Arjun Reddy", "₹12,000"], ["Priya Sharma", "₹1,500"]],
  },
  {
    q: "मेरे कुल कितने ग्राहक हैं?",
    sql: "SELECT COUNT(*) AS total FROM customers",
    rows: [["total", "3"]],
  },
];

type Phase = "typing" | "thinking" | "sql" | "result" | "pause";

export default function AskBarPreview() {
  const [demoIndex, setDemoIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");

  useEffect(() => {
    const demo = DEMO[demoIndex];
    let t: NodeJS.Timeout;
    if (phase === "typing") {
      if (text.length < demo.q.length) {
        t = setTimeout(() => setText(demo.q.slice(0, text.length + 1)), 45);
      } else {
        t = setTimeout(() => setPhase("thinking"), 500);
      }
    } else if (phase === "thinking") {
      t = setTimeout(() => setPhase("sql"), 900);
    } else if (phase === "sql") {
      t = setTimeout(() => setPhase("result"), 1300);
    } else if (phase === "result") {
      t = setTimeout(() => setPhase("pause"), 2600);
    } else {
      t = setTimeout(() => {
        setText("");
        setPhase("typing");
        setDemoIndex((i) => (i + 1) % DEMO.length);
      }, 600);
    }
    return () => clearTimeout(t);
  }, [text, phase, demoIndex]);

  const demo = DEMO[demoIndex];

  return (
    <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-surface/80 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
      <div className="flex items-center gap-2 border-b border-white/8 px-5 py-3.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-2 font-mono text-xs text-mist">QueryMind</span>
      </div>

      <div className="flex items-center gap-3 px-5 py-4">
        <span className="bg-gradient-to-br from-gold to-violet bg-clip-text text-transparent">◆</span>
        <span className="flex-1 text-left text-[15px] text-ink">
          {text}
          <span
            className="ml-0.5 inline-block h-4 w-[2px] bg-gold align-middle"
            style={{ animation: "cursor-blink 1s step-end infinite" }}
          />
        </span>
      </div>

      <div className="min-h-[136px] border-t border-white/8 bg-black/20 px-5 py-4">
        {phase === "thinking" && (
          <div className="flex items-center gap-2 text-sm text-mist">
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold" style={{ animationDelay: "300ms" }} />
            </span>
            Generating SQL
          </div>
        )}

        {(phase === "sql" || phase === "result" || phase === "pause") && (
          <div className="animate-fade-in-up flex flex-col gap-3">
            <pre className="whitespace-pre-wrap rounded-xl bg-black/40 px-3.5 py-3 font-mono text-xs leading-relaxed text-violet">
              {demo.sql}
            </pre>
          </div>
        )}

        {(phase === "result" || phase === "pause") && (
          <div className="animate-fade-in-up mt-3 overflow-hidden rounded-xl border border-white/8">
            <table className="w-full text-left text-sm">
              <tbody>
                {demo.rows.map((row, i) => (
                  <tr key={i} className="border-t border-white/8 first:border-t-0">
                    {row.map((cell, j) => (
                      <td key={j} className="px-3.5 py-2 text-ink">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
