"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { generateSql, executeSql, explainSql, estimateQuery, getHistory } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import AppHeader from "@/components/AppHeader";
import GradientOrbs from "@/components/GradientOrbs";
import Magnetic from "@/components/Magnetic";
import ResultViz from "@/components/ResultViz";

type Result = { columns: string[]; rows: (string | number)[][] };
type HistoryEntry = { question: string; sql: string };
type PersistentHistoryEntry = { id: number; question: string; sql: string; created_at: string };

export default function AskPage() {
  return (
    <Suspense
      fallback={
        <main className="relative min-h-screen bg-graphite">
          <GradientOrbs />
          <AppHeader />
          <div className="relative z-10 mx-auto max-w-3xl px-6 py-14">
            <div className="skeleton h-8 w-48 rounded-xl" />
          </div>
        </main>
      }
    >
      <AskPageInner />
    </Suspense>
  );
}

function AskPageInner() {
  const searchParams = useSearchParams();
  const connectionId = Number(searchParams.get("connection_id"));

  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [persistentHistory, setPersistentHistory] = useState<PersistentHistoryEntry[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [clarification, setClarification] = useState<string | null>(null);
  
  const [sql, setSql] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [generating, setGenerating] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [explanation, setExplanation] = useState("");
  const [explaining, setExplaining] = useState(false);
  const [retried, setRetried] = useState(false);
  const [estimate, setEstimate] = useState<{ estimated_rows: number | null, estimated_cost: number | null } | null>(null);
  
  const toast = useToast();

  useEffect(() => {
    if (connectionId) {
      getHistory(connectionId).then(setPersistentHistory).catch(console.error);
    }
  }, [connectionId]);

  async function handleGenerate(overrideQuestion?: string) {
    const q = overrideQuestion ?? question;
    if (!q) return;

    setGenerating(true);
    setError("");
    setResult(null);
    setExplanation("");
    setClarification(null);
    setRetried(false);
    setEstimate(null);

    try {
      const data = await generateSql(connectionId, q, history);
      if (data.type === "clarification") {
        setClarification(data.question);
        setSql("");
      } else {
        setSql(data.generated_sql);
        toast("SQL generated — review and run it", "info");
        // Fetch estimate silently in background
        estimateQuery(connectionId, data.generated_sql)
          .then(setEstimate)
          .catch(() => {}); // ignore estimate errors
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not generate SQL";
      setError(msg);
      toast(msg, "error");
    } finally {
      setGenerating(false);
    }
  }

  async function handleRun() {
    setRunning(true);
    setError("");
    setRetried(false);
    try {
      const data = await executeSql(connectionId, sql, question);
      if (data.retried) {
        setRetried(true);
        setSql(data.generated_sql); // Update the text area with the fixed SQL
      }
      setResult({ columns: data.columns, rows: data.rows });
      toast(`Returned ${data.rows.length} row${data.rows.length === 1 ? "" : "s"}`, "success");
      
      // Feature 3: On successful run, save to history
      setHistory(prev => [...prev, { question, sql: data.generated_sql }]);
      // Feature 8: Refresh persistent history from server
      getHistory(connectionId).then(setPersistentHistory).catch(console.error);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Query failed";
      setError(msg);
      toast(msg, "error");
    } finally {
      setRunning(false);
    }
  }

  async function handleExplain() {
    setExplaining(true);
    setExplanation("");
    try {
      const data = await explainSql(sql);
      setExplanation(data.explanation);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not explain query", "error");
    } finally {
      setExplaining(false);
    }
  }

  function handleClarificationSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const answer = formData.get("answer") as string;
    if (!answer.trim()) return;

    const newQuestion = `${question} (Clarification: ${answer})`;
    setQuestion(newQuestion);
    handleGenerate(newQuestion);
  }

  return (
    <main className="relative min-h-screen bg-graphite overflow-hidden">
      <GradientOrbs />
      <AppHeader />

      {/* Feature 8: Persistent History Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-80 transform border-l border-white/10 bg-surface/95 backdrop-blur-xl transition-transform duration-300 ease-in-out ${
          isHistoryOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 p-6">
            <h2 className="font-display text-lg font-bold text-ink">Query History</h2>
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="text-mist hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {persistentHistory.length === 0 ? (
              <p className="text-sm text-mist">No saved queries yet.</p>
            ) : (
              persistentHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="group cursor-pointer rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04]"
                  onClick={() => {
                    setQuestion(entry.question);
                    setSql(entry.sql);
                    setResult(null);
                    setIsHistoryOpen(false);
                  }}
                >
                  <p className="text-sm font-medium text-ink line-clamp-2">{entry.question}</p>
                  <p className="mt-2 font-mono text-[10px] text-violet/80 line-clamp-2">{entry.sql}</p>
                  <p className="mt-2 text-[9px] text-mist/60 uppercase">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-14">
        
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-mist transition-colors hover:bg-white/10 hover:text-white"
          >
            <span>Clock</span> History
          </button>
        </div>
        
        {/* Feature 3: Conversation History */}
        {history.length > 0 && (
          <div className="animate-fade-in-up mb-8 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Conversation</p>
              <button 
                onClick={() => { setHistory([]); setQuestion(""); setSql(""); setResult(null); }}
                className="text-[10px] uppercase tracking-wide text-mist hover:text-ink transition-colors"
              >
                Clear history
              </button>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              {history.map((entry, idx) => (
                <div key={idx} className="flex flex-col gap-1 text-sm">
                  <p className="font-medium text-ink"><span className="text-mist mr-2">Q:</span>{entry.question}</p>
                  <p className="font-mono text-xs text-violet/80 truncate"><span className="text-mist mr-2 font-sans">SQL:</span>{entry.sql}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="animate-fade-in-up mb-8">
          {history.length === 0 && <p className="mb-1 font-mono text-xs uppercase tracking-[0.3em] text-gold">Query</p>}
          <h1 className="font-display text-3xl font-extrabold text-ink">
            {history.length > 0 ? "Ask a follow-up" : "Ask a question"}
          </h1>
        </div>

        <div className="animate-spring-in flex items-center gap-3 rounded-3xl border border-white/10 bg-surface/60 p-2.5 backdrop-blur-xl transition-all duration-200 focus-within:border-gold/40 focus-within:ring-4 focus-within:ring-gold/10">
          <span className="pl-3 text-mist">◆</span>
          <input
            placeholder={history.length > 0 ? "e.g. now filter it to last month..." : "e.g. show me all rows from customers"}
            className="flex-1 bg-transparent px-1 py-2.5 text-ink placeholder:text-mist/50 focus:outline-none"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && question && handleGenerate()}
          />
          <Magnetic strength={40}>
            <button
              onClick={() => handleGenerate()}
              disabled={generating || !question}
              className="cursor-pointer rounded-2xl bg-gradient-to-r from-gold to-violet px-6 py-3 font-display font-bold text-graphite shadow-[0_10px_30px_-10px_rgba(139,92,246,0.5)] transition-transform duration-150 hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            >
              {generating ? "..." : "Generate SQL"}
            </button>
          </Magnetic>
        </div>

        {generating && (
          <div className="animate-fade-in-up mt-6 flex items-center gap-2 text-sm text-mist">
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold" style={{ animationDelay: "300ms" }} />
            </span>
            Reading your schema and drafting SQL...
          </div>
        )}

        {/* Feature 2: Clarification UI */}
        {clarification && (
          <div className="animate-fade-in-up mt-8 overflow-hidden rounded-3xl border border-gold/30 bg-gold/5 p-6 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold">?</span>
              <div>
                <h3 className="font-display text-lg font-bold text-gold">Clarification needed</h3>
                <p className="mt-1 text-sm text-mist">{clarification}</p>
                <form onSubmit={handleClarificationSubmit} className="mt-4 flex gap-2">
                  <input
                    name="answer"
                    autoFocus
                    placeholder="Type your answer here..."
                    className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-ink focus:border-gold/50 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-white/20"
                  >
                    Reply
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {sql && (
          <div className="animate-fade-in-up mt-8 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-wide text-mist">
                SQL editor — review, edit if needed, then run
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExplain}
                  disabled={explaining || !sql.trim()}
                  className="cursor-pointer rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] text-mist transition hover:border-violet/40 hover:text-violet disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {explaining ? "Explaining..." : "✦ Explain"}
                </button>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] text-mist">
                  SELECT-only, validated
                </span>
              </div>
            </div>

            {explanation && (
              <div className="animate-fade-in-up rounded-2xl border border-violet/20 bg-violet/5 px-4 py-3 text-sm text-ink">
                <span className="mr-1.5 text-violet">✦</span>
                {explanation}
              </div>
            )}

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl">
              <div className="flex items-center gap-2 border-b border-white/8 px-5 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                <span className="ml-2 font-mono text-xs text-mist">query.sql</span>
              </div>
              <textarea
                value={sql}
                onChange={(e) => setSql(e.target.value)}
                rows={5}
                spellCheck={false}
                className="w-full resize-none bg-transparent px-5 py-4 font-mono text-sm leading-relaxed text-violet focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <Magnetic strength={35}>
                <button
                  onClick={handleRun}
                  disabled={running || !sql.trim()}
                  className="flex w-fit cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-violet to-gold px-6 py-3 font-display font-bold text-graphite shadow-[0_15px_40px_-12px_rgba(139,92,246,0.5)] transition-transform duration-150 hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  {running ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-graphite/30 border-t-graphite" />
                      Running...
                    </>
                  ) : (
                    <>▶ Run query</>
                  )}
                </button>
              </Magnetic>
              
              {estimate && (
                <div className="animate-fade-in-up flex items-center gap-2 rounded-full border border-white/5 bg-black/40 px-3 py-1 font-mono text-[10px] text-mist">
                  <span>~{estimate.estimated_rows?.toLocaleString() ?? "?"} rows</span>
                  <span className="text-white/20">•</span>
                  <span>Cost: {estimate.estimated_cost?.toLocaleString() ?? "?"}</span>
                  {estimate.estimated_cost && estimate.estimated_cost > 10000 && (
                    <span className="ml-1 rounded bg-red-500/20 px-1 text-red-300">High cost</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <p className="animate-fade-in-up mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {result && (
          <div className="animate-fade-in-up mt-8">
            {retried && (
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-gold">
                <span className="text-[14px]">⚡</span> Auto-corrected query error
              </div>
            )}
            <ResultViz columns={result.columns} rows={result.rows} />
          </div>
        )}
      </div>
    </main>
  );
}