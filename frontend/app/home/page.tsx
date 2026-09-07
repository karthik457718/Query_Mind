"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { listConnections } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import AppHeader from "@/components/AppHeader";
import DatabaseArchitectureCanvas from "@/components/DatabaseArchitectureCanvas";
import Magnetic from "@/components/Magnetic";

type Connection = {
  id: number;
  nickname: string;
  engine_type: string;
  host: string;
  database_name: string;
};

export default function HomePage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [engineFilter, setEngineFilter] = useState<"all" | "postgresql" | "mysql">("all");
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    listConnections()
      .then(setConnections)
      .finally(() => setLoading(false));
  }, [router]);

  const filteredConnections = connections.filter((c) => {
    const matchesSearch =
      c.nickname.toLowerCase().includes(search.toLowerCase()) ||
      c.database_name.toLowerCase().includes(search.toLowerCase()) ||
      c.host.toLowerCase().includes(search.toLowerCase());
    const matchesEngine = engineFilter === "all" || c.engine_type.toLowerCase() === engineFilter;
    return matchesSearch && matchesEngine;
  });

  const postgresCount = connections.filter((c) => c.engine_type.toLowerCase() === "postgresql").length;
  const mysqlCount = connections.filter((c) => c.engine_type.toLowerCase() === "mysql").length;

  return (
    <main className="relative min-h-screen bg-[#0f1117] text-[#f3f4f6] selection:bg-[#3dd17e]/30 selection:text-[#3dd17e] overflow-x-hidden">
      {/* Relational Graph & Schema Vector Background */}
      <DatabaseArchitectureCanvas />
      <AppHeader />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-10 lg:py-14">
        {/* Workspace Hero Header */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#3dd17e] animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#3dd17e] font-semibold">
                Topology & Connections
              </span>
            </div>
            <h1 className="font-display text-4xl font-extrabold text-white sm:text-5xl tracking-tight">
              Connected Databases
            </h1>
            <p className="mt-2.5 text-sm text-[#94a3b8] max-w-xl leading-relaxed">
              Active PostgreSQL and MySQL database nodes. Launch natural language SQL queries with RAG schema retrieval and sqlglot AST execution guardrails.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Magnetic strength={24}>
              <Link
                href="/connect"
                className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-2xl bg-[#f0533d] px-6 py-3.5 font-display text-sm font-bold text-white shadow-[0_12px_35px_-8px_rgba(240,83,61,0.5)] transition-all duration-200 hover:bg-[#d94430] hover:scale-[1.02] active:scale-95"
              >
                <span className="text-lg font-light leading-none transition-transform duration-300 group-hover:rotate-90">＋</span>
                Connect Database
              </Link>
            </Magnetic>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-[#1a1e2e]/80 p-5 backdrop-blur-xl transition-all hover:border-white/20">
            <p className="font-mono text-xs uppercase tracking-wider text-[#94a3b8]">Total Nodes</p>
            <p className="mt-2 font-display text-3xl font-bold text-white">
              {loading ? "..." : connections.length}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#1a1e2e]/80 p-5 backdrop-blur-xl transition-all hover:border-white/20">
            <p className="font-mono text-xs uppercase tracking-wider text-[#94a3b8]">PostgreSQL Clusters</p>
            <p className="mt-2 font-display text-3xl font-bold text-[#3dd17e]">
              {loading ? "..." : postgresCount}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#1a1e2e]/80 p-5 backdrop-blur-xl transition-all hover:border-white/20">
            <p className="font-mono text-xs uppercase tracking-wider text-[#94a3b8]">MySQL Instances</p>
            <p className="mt-2 font-display text-3xl font-bold text-sky-400">
              {loading ? "..." : mysqlCount}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#1a1e2e]/80 p-5 backdrop-blur-xl transition-all hover:border-white/20">
            <p className="font-mono text-xs uppercase tracking-wider text-[#94a3b8]">AST Security</p>
            <p className="mt-2 font-display text-2xl font-bold text-[#3dd17e] flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#3dd17e]" />
              sqlglot AST
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Filter by nickname, host, or database name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#121215]/80 px-5 py-3.5 text-sm text-white placeholder:text-[#94a3b8]/50 transition-all focus:border-[#3dd17e] focus:outline-none focus:ring-4 focus:ring-[#3dd17e]/20"
            />
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#121215]/60 p-1">
            {(["all", "postgresql", "mysql"] as const).map((engine) => {
              const active = engineFilter === engine;
              return (
                <button
                  key={engine}
                  onClick={() => setEngineFilter(engine)}
                  className={`rounded-xl px-4 py-2 text-xs font-mono font-semibold uppercase transition-all ${
                    active
                      ? "bg-[#3dd17e]/20 text-[#3dd17e] border border-[#3dd17e]/40 shadow-sm"
                      : "text-[#94a3b8] hover:text-white"
                  }`}
                >
                  {engine}
                </button>
              );
            })}
          </div>
        </div>

        {/* Database Node Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-52 rounded-3xl border border-white/10 bg-[#1a1e2e]/40 animate-pulse"
              />
            ))}
          </div>
        ) : filteredConnections.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-5 rounded-3xl border border-dashed border-white/15 bg-[#1a1e2e]/60 px-8 py-20 text-center backdrop-blur-2xl transition hover:border-[#3dd17e]/40">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-2xl text-[#3dd17e]">
              ⛁
            </div>

            <div className="max-w-md">
              <h3 className="font-display text-2xl font-bold text-white">No database nodes found</h3>
              <p className="mt-2 text-sm text-[#94a3b8] leading-relaxed">
                {connections.length === 0
                  ? "Connect your first PostgreSQL or MySQL database. Credentials are Fernet-encrypted at rest and all execution calls clear sqlglot AST bounds."
                  : "No connected databases match your current search filters."}
              </p>
            </div>

            <Magnetic strength={20}>
              <Link
                href="/connect"
                className="mt-2 group inline-flex items-center gap-2 rounded-2xl bg-[#f0533d] px-6 py-3.5 font-display text-sm font-bold text-white shadow-[0_10px_25px_-6px_rgba(240,83,61,0.5)] transition-all hover:bg-[#d94430] active:scale-95"
              >
                Connect New Database
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </Magnetic>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredConnections.map((conn) => (
              <Link
                key={conn.id}
                href={`/ask?connection_id=${conn.id}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#1a1e2e]/80 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-[#3dd17e]/40 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]"
              >
                {/* Glowing Corner Indicator */}
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#3dd17e]/10 blur-2xl transition-all duration-500 group-hover:bg-[#3dd17e]/25 group-hover:scale-125" />

                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#3dd17e]">
                        NODE #{conn.id}
                      </span>
                      <h4 className="font-display text-2xl font-bold text-white group-hover:text-[#3dd17e] transition-colors mt-0.5">
                        {conn.nickname}
                      </h4>
                    </div>

                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8] backdrop-blur-md">
                      {conn.engine_type}
                    </span>
                  </div>

                  <div className="mt-5 space-y-1.5 font-mono text-xs text-[#94a3b8]">
                    <p className="truncate flex items-center justify-between">
                      <span className="text-white/40">Host:</span>
                      <span className="text-white">{conn.host}</span>
                    </p>
                    <p className="truncate flex items-center justify-between">
                      <span className="text-white/40">Database:</span>
                      <span className="text-white">{conn.database_name}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs font-semibold text-[#3dd17e]">
                  <span className="flex items-center gap-1.5 text-[#94a3b8] group-hover:text-white transition-colors">
                    <span className="h-2 w-2 rounded-full bg-[#3dd17e] animate-pulse" />
                    Introspected & Ready
                  </span>
                  <span className="flex items-center gap-1 transition-transform group-hover:translate-x-1">
                    Launch Query →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
