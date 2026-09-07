"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createConnection } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import AppHeader from "@/components/AppHeader";
import DatabaseArchitectureCanvas from "@/components/DatabaseArchitectureCanvas";
import Magnetic from "@/components/Magnetic";

export default function ConnectPage() {
  const [form, setForm] = useState({
    nickname: "",
    engine_type: "postgresql" as "postgresql" | "mysql",
    host: "",
    port: 5432,
    database_name: "",
    username: "",
    password: "",
  });
  const [status, setStatus] = useState<"idle" | "testing" | "success">("idle");
  const [error, setError] = useState("");
  const router = useRouter();
  const toast = useToast();

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleEngineChange(engine: "postgresql" | "mysql") {
    const defaultPort = engine === "postgresql" ? 5432 : 3306;
    setForm((prev) => ({ ...prev, engine_type: engine, port: defaultPort }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nickname || !form.host || !form.database_name || !form.username) {
      const msg = "Please complete all required connection parameters.";
      setError(msg);
      toast(msg, "error");
      return;
    }

    setStatus("testing");
    setError("");
    try {
      await createConnection(form);
      setStatus("success");
      toast("Database connected & Fernet encrypted successfully", "success");
      setTimeout(() => router.push("/home"), 800);
    } catch (err) {
      setStatus("idle");
      const msg = err instanceof Error ? err.message : "Database connection handshake failed.";
      setError(msg);
      toast(msg, "error");
    }
  }

  return (
    <main className="relative min-h-screen bg-[#0f1117] text-[#f3f4f6] selection:bg-[#3dd17e]/30 selection:text-[#3dd17e] overflow-x-hidden">
      {/* Interactive Relational Graph & Grid Background */}
      <DatabaseArchitectureCanvas />
      <AppHeader />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-10 lg:py-14">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center gap-2 font-mono text-xs text-[#94a3b8]">
          <Link href="/home" className="hover:text-white transition-colors">
            Databases
          </Link>
          <span>/</span>
          <span className="text-[#3dd17e] font-semibold">New Connection</span>
        </div>

        {/* 2-Column Split Architecture Layout */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Contextual Architecture & Security Info */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-[#3dd17e]/30 bg-[#3dd17e]/10 px-3.5 py-1 text-xs font-mono font-semibold text-[#3dd17e]">
                <span className="h-2 w-2 rounded-full bg-[#3dd17e] animate-pulse" />
                Live Connection Handshake
              </div>
              <h1 className="font-display text-4xl font-extrabold text-white sm:text-5xl tracking-tight leading-tight">
                Connect your database
              </h1>
              <p className="mt-3 text-sm text-[#94a3b8] leading-relaxed">
                Add your live PostgreSQL or MySQL database connection. Raw passwords are Fernet-encrypted at rest and all execution calls are bounded by sqlglot AST parsing.
              </p>
            </div>

            {/* Connection Flow Steps */}
            <div className="space-y-3.5 rounded-3xl border border-white/10 bg-[#1a1e2e]/70 p-6 backdrop-blur-xl">
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#94a3b8]">
                Handshake Protocol
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#3dd17e]/20 font-mono font-bold text-[#3dd17e]">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-white">Schema Introspection</p>
                    <p className="text-[#94a3b8]">Reads table metadata without pulling raw data rows.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#3dd17e]/20 font-mono font-bold text-[#3dd17e]">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-white">Fernet Symmetric Keying</p>
                    <p className="text-[#94a3b8]">Credentials are locked with symmetric Fernet encryption.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#3dd17e]/20 font-mono font-bold text-[#3dd17e]">
                    3
                  </span>
                  <div>
                    <p className="font-semibold text-white">SELECT-only AST Guardrail</p>
                    <p className="text-[#94a3b8]">Destructive statements (DROP, DELETE, UPDATE) are blocked.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Engine Badges */}
            <div className="flex items-center gap-3 pt-2 text-xs font-mono text-[#94a3b8]">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">PostgreSQL v12+</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">MySQL v8.0+</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">SSL Supported</span>
            </div>
          </div>

          {/* Right Column: Connection Form Card */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#1a1e2e]/90 p-8 backdrop-blur-2xl shadow-[0_30px_70px_-20px_rgba(0,0,0,0.8)] transition-all"
            >
              {/* Top Accent Gradient Border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3dd17e] via-white to-[#f0533d]" />

              <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center justify-between">
                <span>Connection Parameters</span>
                <span className="font-mono text-xs font-normal text-[#94a3b8]">TLS/SSL Encrypted</span>
              </h2>

              <div className="space-y-5">
                {/* Connection Nickname */}
                <div className="space-y-1.5">
                  <label className="font-mono text-xs uppercase tracking-wider text-[#94a3b8]">
                    Connection Nickname <span className="text-[#f0533d]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Production Analytics Replica"
                    value={form.nickname}
                    onChange={(e) => update("nickname", e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#121215]/80 px-4 py-3.5 text-sm text-white placeholder:text-[#94a3b8]/50 transition-all focus:border-[#3dd17e] focus:outline-none focus:ring-4 focus:ring-[#3dd17e]/20"
                  />
                </div>

                {/* Engine Selection Segmented Control */}
                <div className="space-y-1.5">
                  <label className="font-mono text-xs uppercase tracking-wider text-[#94a3b8]">
                    Database Engine <span className="text-[#f0533d]">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["postgresql", "mysql"] as const).map((engine) => {
                      const active = form.engine_type === engine;
                      return (
                        <button
                          key={engine}
                          type="button"
                          onClick={() => handleEngineChange(engine)}
                          className={`relative flex items-center justify-center gap-2 rounded-2xl border px-4 py-3.5 text-sm font-semibold capitalize transition-all duration-200 ${
                            active
                              ? "border-[#3dd17e] bg-[#3dd17e]/15 text-white shadow-[0_0_20px_rgba(61,209,126,0.2)]"
                              : "border-white/10 bg-[#121215]/60 text-[#94a3b8] hover:border-white/20 hover:text-white"
                          }`}
                        >
                          <span className={`h-2 w-2 rounded-full ${active ? "bg-[#3dd17e]" : "bg-white/20"}`} />
                          {engine === "postgresql" ? "PostgreSQL" : "MySQL"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Host and Port */}
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-8 space-y-1.5">
                    <label className="font-mono text-xs uppercase tracking-wider text-[#94a3b8]">
                      Host / Endpoint <span className="text-[#f0533d]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="db.example.com or localhost"
                      value={form.host}
                      onChange={(e) => update("host", e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-[#121215]/80 px-4 py-3.5 text-sm text-white placeholder:text-[#94a3b8]/50 transition-all focus:border-[#3dd17e] focus:outline-none focus:ring-4 focus:ring-[#3dd17e]/20"
                    />
                  </div>

                  <div className="col-span-4 space-y-1.5">
                    <label className="font-mono text-xs uppercase tracking-wider text-[#94a3b8]">
                      Port <span className="text-[#f0533d]">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={form.port}
                      onChange={(e) => update("port", Number(e.target.value))}
                      className="w-full rounded-2xl border border-white/10 bg-[#121215]/80 px-4 py-3.5 text-sm font-mono text-white transition-all focus:border-[#3dd17e] focus:outline-none focus:ring-4 focus:ring-[#3dd17e]/20"
                    />
                  </div>
                </div>

                {/* Database Name */}
                <div className="space-y-1.5">
                  <label className="font-mono text-xs uppercase tracking-wider text-[#94a3b8]">
                    Database Name <span className="text-[#f0533d]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. analytics_db"
                    value={form.database_name}
                    onChange={(e) => update("database_name", e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#121215]/80 px-4 py-3.5 text-sm text-white placeholder:text-[#94a3b8]/50 transition-all focus:border-[#3dd17e] focus:outline-none focus:ring-4 focus:ring-[#3dd17e]/20"
                  />
                </div>

                {/* Credentials: Username and Password */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="font-mono text-xs uppercase tracking-wider text-[#94a3b8]">
                      Username <span className="text-[#f0533d]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="read_only_user"
                      value={form.username}
                      onChange={(e) => update("username", e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-[#121215]/80 px-4 py-3.5 text-sm text-white placeholder:text-[#94a3b8]/50 transition-all focus:border-[#3dd17e] focus:outline-none focus:ring-4 focus:ring-[#3dd17e]/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-xs uppercase tracking-wider text-[#94a3b8]">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-[#121215]/80 px-4 py-3.5 text-sm text-white placeholder:text-[#94a3b8]/50 transition-all focus:border-[#3dd17e] focus:outline-none focus:ring-4 focus:ring-[#3dd17e]/20"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <Magnetic strength={25}>
                    <button
                      type="submit"
                      disabled={status === "testing" || status === "success"}
                      className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-[#f0533d] px-6 py-4 font-display text-sm font-bold text-white shadow-[0_12px_30px_-8px_rgba(240,83,61,0.5)] transition-all duration-200 hover:bg-[#d94430] hover:shadow-[0_16px_40px_-8px_rgba(240,83,61,0.6)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {status === "testing" && (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Performing Handshake...
                        </>
                      )}
                      {status === "success" && (
                        <>
                          <span className="text-base">✓</span>
                          Connected & Fernet Encrypted!
                        </>
                      )}
                      {status === "idle" && (
                        <>
                          Test & Save Connection
                          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                        </>
                      )}
                    </button>
                  </Magnetic>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="animate-fade-in-up rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-mono text-red-300 leading-relaxed">
                    <p className="font-semibold text-red-200 mb-0.5">Connection Failed:</p>
                    {error}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
