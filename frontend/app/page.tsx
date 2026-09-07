"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import DatabaseArchitectureCanvas from "@/components/DatabaseArchitectureCanvas";
import Magnetic from "@/components/Magnetic";
import "@/app/marketing.css";

/* ---------- tiny useInView hook ---------- */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ---------- Verified Codebase Architecture ---------- */
const STAGES = [
  { n: "01", title: "Introspect", desc: "SQLAlchemy introspects Postgres/MySQL table metadata and column types directly.", active: true },
  { n: "02", title: "Rank & RAG", desc: "Jaccard similarity ranks table relevance based on question keywords to select relevant schema context.", active: false },
  { n: "03", title: "Validate AST", desc: "sqlglot parses the generated SQL statement and blocks non-SELECT queries before execution.", active: false },
  { n: "04", title: "Auto-Shape", desc: "Query results automatically render as metric cards, bar charts, or paginated data tables.", active: false },
];

const STEPS = [
  { i: "01", title: "Connect Live Instance", desc: "Add your database connection string. Credentials are Fernet-encrypted at rest." },
  { i: "02", title: "Ask in Plain English", desc: "Type natural questions. QueryMind extracts schema keywords and routes intent to LLM prompts." },
  { i: "03", title: "Review AST Validation", desc: "Inspect the generated SQL alongside pre-flight EXPLAIN query cost estimates." },
  { i: "04", title: "Explore & Export", desc: "Interact with auto-visualized data cards, ask follow-up questions, or export CSV/JSON." },
];

const FEATURES = [
  { icon: "⚡", title: "Schema Keyword RAG", desc: "Jaccard similarity filters relevant tables from database schemas to build concise LLM context." },
  { icon: "🛡️", title: "sqlglot AST Guardrail", desc: "AST parsing blocks destructive statements (DROP, DELETE, UPDATE) prior to execution." },
  { icon: "🔄", title: "Self-Correction Loop", desc: "Automatic retries feed database dialect error tracebacks back to the LLM until valid SQL is produced." },
  { icon: "📊", title: "Smart Auto-Visualization", desc: "Query result sets auto-shape into scalar metric cards, bar charts, or paginated tables." },
  { icon: "🔐", title: "Fernet Encrypted Secrets", desc: "Database passwords locked with symmetric Fernet encryption before persisting." },
  { icon: "💬", title: "Multi-Turn Memory", desc: "Contextual conversation thread allows seamless follow-up query refinements." },
];

const SECURITY = [
  {
    label: "✓ SELECT-only AST",
    title: "Zero Destructive Queries",
    desc: "sqlglot inspects every statement including nested CTEs to guarantee read-only safety.",
  },
  {
    label: "⏱ Pre-flight EXPLAIN",
    title: "Cost & Execution Bounds",
    desc: "Every query runs a preliminary EXPLAIN plan to estimate execution cost and row count.",
  },
  {
    label: "🔑 Fernet Symmetric Encryption",
    title: "Encrypted at Rest",
    desc: "Connection secrets are encrypted using Fernet keys and never stored in plain text.",
  },
  {
    label: "🔐 OTP Passwordless Sign-In",
    title: "Zero Password Leaks",
    desc: "Time-sensitive 6-digit email passcodes eliminate phishable password vulnerabilities.",
  },
];

export default function MarketingPage() {
  const gauge = useInView(0.1);
  const demo = useInView(0.1);
  const steps = useInView(0.1);
  const features = useInView(0.1);
  const security = useInView(0.1);

  return (
    <div className="marketing-page relative min-h-screen overflow-x-hidden selection:bg-[#3dd17e]/30 selection:text-[#3dd17e]">
      {/* Dynamic Database Graph & Data Streams Background */}
      <DatabaseArchitectureCanvas />

      {/* ---- STICKY NAV BAR ---- */}
      <header className="m-nav">
        <div className="m-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%" }}>
          <Link href="/" className="m-brand">
            <div className="m-brand-mark">Q</div>
            QueryMind
          </Link>

          <nav className="m-nav-links">
            <a href="#pipeline">Architecture</a>
            <a href="#demo">Live Demo</a>
            <a href="#steps">Workflow</a>
            <a href="#features">Features</a>
            <a href="#security">Security</a>
          </nav>

          <div className="m-nav-actions">
            <Link href="/login" className="m-btn m-btn-ghost">Sign in</Link>
            <Magnetic strength={20}>
              <Link href="/login" className="m-btn m-btn-primary">Launch App</Link>
            </Magnetic>
          </div>
        </div>
      </header>

      {/* ---- HERO SECTION ---- */}
      <section className="m-hero relative z-10" id="pipeline">
        <div className="m-wrap">
          <div className="m-eyebrow">Data Architecture · Schema RAG · AST Guardrails</div>
          <h1>
            Natural Language Interface for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3dd17e] via-white to-[#f0533d]">
              Modern Database Systems
            </span>
          </h1>
          <p className="lede">
            QueryMind maps plain English to safe, verified SQL queries — executing live schema introspection, AST guardrail validation, self-correction retries, and auto-visualization.
          </p>

          <div className="m-hero-actions">
            <Magnetic strength={24}>
              <Link href="/login" className="m-btn m-btn-primary" style={{ padding: "14px 32px", fontSize: "15px" }}>
                Connect Your Database →
              </Link>
            </Magnetic>
            <a href="#demo" className="m-btn m-btn-outline" style={{ padding: "14px 32px", fontSize: "15px" }}>
              Explore Live Architecture
            </a>
          </div>

          {/* Architecture Stage Cards */}
          <div className="m-story-rail mt-12">
            {STAGES.map((s, i) => (
              <div
                key={s.n}
                className="m-stage-card in hover:-translate-y-1 transition-transform"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="m-stage-num">{s.n}</div>
                <div className="m-stage-title">{s.title}</div>
                <div className="m-stage-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- PIPELINE VERIFICATION ARCHITECTURE ---- */}
      <section className="m-gauge-section relative z-10" ref={gauge.ref as React.RefObject<HTMLElement>}>
        <div className="m-wrap">
          <div className="m-gauge-layout">
            <div className="m-gauge-stage">
              <div className="m-gauge-label-row">
                <span>Natural Language</span>
                <span>AST Executed SQL</span>
              </div>
              <div className="flex flex-col items-center justify-center p-8 rounded-3xl border border-white/10 bg-[#1a1e2e]/80 backdrop-blur-xl">
                <span className="font-mono text-xs uppercase tracking-widest text-[#3dd17e]">Deterministic Chain</span>
                <span className="font-display text-4xl font-extrabold text-white mt-2">4 Guardrails</span>
                <span className="text-xs text-[#94a3b8] mt-1 text-center">Introspection → RAG → AST → EXPLAIN</span>
              </div>
            </div>

            <div className="m-gauge-copy">
              <h2>Verified pipeline before execution</h2>
              <p>
                Every query clears schema introspection, Jaccard RAG matching, sqlglot AST verification, and an EXPLAIN plan before touching your storage engine.
              </p>

              <div className="m-pipeline-list">
                {[
                  "SQLAlchemy schema metadata introspection",
                  "Jaccard similarity ranks relevant tables",
                  "sqlglot parses AST to enforce read-only SELECT",
                  "Pre-flight EXPLAIN estimates query cost & row count",
                ].map((item, idx) => (
                  <div key={idx} className="m-pipeline-row">
                    <span className="m-pipe-check">✓</span>
                    <span className="m-pipe-text">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- INTERACTIVE DEMO PLAYGROUND ---- */}
      <section className="m-demo-section relative z-10" id="demo" ref={demo.ref as React.RefObject<HTMLElement>}>
        <div className="m-wrap">
          <div className="m-section-head">
            <span className="m-section-label">Illustrative Translation Example</span>
            <h2>See the SQL Translation Pipeline</h2>
            <p>Illustrative walkthrough using customers and orders database schema.</p>
          </div>

          <div className="m-demo-shell">
            <div className="m-demo-chat">
              <div className="m-chat-row">
                <div className="m-chat-avatar">U</div>
                <div className="m-chat-bubble">Show total orders grouped by customer status</div>
              </div>

              <div className="m-chat-row">
                <div className="m-chat-avatar ai">Q</div>
                <div className="m-chat-bubble ai">
                  Matched <code>customers</code>, <code>orders</code>.<br />
                  <code>SELECT c.status, COUNT(o.id) AS total_orders FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.status;</code>
                </div>
              </div>
            </div>

            <div className="m-demo-panel">
              <div className="m-panel-label">Auto-Visualization Engine</div>
              <div className="m-metric-card">
                <div className="m-metric-value">1,420</div>
                <div className="m-metric-sub">Total Orders Processed · 2 Status Rows Returned</div>
              </div>

              <div className="m-demo-chips">
                <span className="m-demo-chip">SELECT Only</span>
                <span className="m-demo-chip">AST Validated</span>
                <span className="m-demo-chip">Fernet Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- HOW IT WORKS / WORKFLOW ---- */}
      <section className="m-steps-section relative z-10" id="steps" ref={steps.ref as React.RefObject<HTMLElement>}>
        <div className="m-wrap">
          <div className="m-section-head">
            <span className="m-section-label">Four Step Workflow</span>
            <h2>How QueryMind Works</h2>
            <p>From connection string to verified data visualizations in minutes.</p>
          </div>

          <div className="m-steps-list">
            {STEPS.map((s) => (
              <div key={s.i} className="m-step-row">
                <div className="m-step-idx">{s.i}</div>
                <div className="m-step-body">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- FEATURES GRID ---- */}
      <section className="m-features-section relative z-10" id="features" ref={features.ref as React.RefObject<HTMLElement>}>
        <div className="m-wrap">
          <div className="m-section-head">
            <span className="m-section-label">Engine Capabilities</span>
            <h2>Built for Data Teams & Engineers</h2>
            <p>Safety guardrails paired with natural language query convenience.</p>
          </div>

          <div className="m-feature-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="m-feature-card">
                <div className="m-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- SECURITY STRIP ---- */}
      <section className="m-security-strip relative z-10" id="security" ref={security.ref as React.RefObject<HTMLElement>}>
        <div className="m-wrap">
          <div className="m-section-head">
            <span className="m-section-label">Zero Compromise Security</span>
            <h2>Security & Safety Architecture</h2>
          </div>

          <div className="m-security-grid">
            {SECURITY.map((s, i) => (
              <div key={i} className="m-security-item">
                <span className="m-security-badge m-badge-green">{s.label}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- FINAL CTA ---- */}
      <section className="m-cta-section relative z-10">
        <div className="m-wrap">
          <div className="m-cta-card">
            <h2>Ready to query your database in plain English?</h2>
            <p>Connect your PostgreSQL or MySQL database to QueryMind in seconds.</p>
            <div className="m-cta-actions">
              <Magnetic strength={24}>
                <Link href="/login" className="m-btn m-btn-primary" style={{ padding: "14px 36px", fontSize: "16px" }}>
                  Launch QueryMind →
                </Link>
              </Magnetic>
            </div>
          </div>
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer className="m-footer relative z-10">
        <div className="m-wrap">
          <div className="m-footer-grid">
            <div className="m-footer-brand">
              <div className="m-brand"><div className="m-brand-mark">Q</div>QueryMind</div>
              <p>Natural language text-to-SQL engine with AST guardrails and Fernet credential encryption.</p>
            </div>
            <div className="m-footer-col">
              <h4>Navigation</h4>
              <a href="#pipeline">Architecture</a>
              <a href="#demo">Live Demo</a>
              <a href="#features">Features</a>
              <a href="#security">Security</a>
            </div>
            <div className="m-footer-col">
              <h4>Security Stack</h4>
              <a href="#security">sqlglot AST</a>
              <a href="#security">Fernet Encryption</a>
              <a href="#security">EXPLAIN Estimator</a>
            </div>
          </div>

          <div className="m-footer-bottom">
            <p>QueryMind — Open Source Data Exploration Tool</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
