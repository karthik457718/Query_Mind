"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

/* ─── Types ─────────────────────────────────────────────────────── */

type Props = {
  columns: string[];
  rows: (string | number | null)[][];
};

type Shape = "metric" | "bar" | "line" | "table";

/* ─── Shape detection ───────────────────────────────────────────── */

function isNumeric(v: unknown): v is number {
  return typeof v === "number" || (typeof v === "string" && v !== "" && !isNaN(Number(v)));
}

function looksLikeDate(v: unknown): boolean {
  if (typeof v !== "string") return false;
  // ISO dates, YYYY-MM-DD, YYYY-MM, or common date-ish patterns
  return /^\d{4}-\d{2}(-\d{2})?/.test(v);
}

function detectShape(columns: string[], rows: (string | number | null)[][]): Shape {
  if (columns.length === 1 && rows.length === 1 && isNumeric(rows[0][0])) {
    return "metric";
  }

  if (columns.length === 2 && rows.length >= 2) {
    // Determine which column is numeric
    const allFirstNumeric = rows.every((r) => isNumeric(r[0]));
    const allSecondNumeric = rows.every((r) => isNumeric(r[1]));

    if (allFirstNumeric && !allSecondNumeric) {
      // numeric, label — swap isn't standard, still chart-able
      const xIsDate = rows.every((r) => looksLikeDate(r[1]));
      return xIsDate ? "line" : "bar";
    }
    if (allSecondNumeric && !allFirstNumeric) {
      const xIsDate = rows.every((r) => looksLikeDate(r[0]));
      return xIsDate ? "line" : "bar";
    }
  }

  return "table";
}

/* ─── Metric Card ───────────────────────────────────────────────── */

function MetricCard({ label, value }: { label: string; value: number }) {
  const formatted =
    Math.abs(value) >= 1_000_000
      ? `${(value / 1_000_000).toFixed(1)}M`
      : Math.abs(value) >= 1_000
        ? `${(value / 1_000).toFixed(1)}K`
        : value.toLocaleString();

  return (
    <div className="animate-spring-in flex flex-col items-center gap-3 rounded-3xl border border-white/10 bg-gradient-to-br from-gold/10 via-surface/80 to-violet/10 px-10 py-12 text-center backdrop-blur-xl">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-mist">{label}</p>
      <p className="bg-gradient-to-r from-gold to-violet bg-clip-text font-display text-6xl font-extrabold text-transparent">
        {formatted}
      </p>
    </div>
  );
}

/* ─── Chart tooltip ─────────────────────────────────────────────── */

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-surface/90 px-3 py-2 font-mono text-xs text-ink shadow-xl backdrop-blur-md">
      <p className="mb-0.5 text-mist">{label}</p>
      <p className="font-bold text-gold">{payload[0].value.toLocaleString()}</p>
    </div>
  );
}

/* ─── Bar / Line chart ──────────────────────────────────────────── */

const BAR_COLORS = [
  "#F2B84B", "#8B5CF6", "#E879A0", "#34D399", "#60A5FA",
  "#F97316", "#A78BFA", "#FBBF24", "#6EE7B7", "#93C5FD",
];

function ChartViz({
  shape,
  columns,
  rows,
}: {
  shape: "bar" | "line";
  columns: string[];
  rows: (string | number | null)[][];
}) {
  // Figure out which column is the category (x) and which is the value (y)
  const firstColNumeric = rows.every((r) => isNumeric(r[0]));
  const xIdx = firstColNumeric ? 1 : 0;
  const yIdx = firstColNumeric ? 0 : 1;

  const data = rows.map((row) => ({
    name: String(row[xIdx] ?? ""),
    value: Number(row[yIdx]),
  }));

  const Chart = shape === "line" ? LineChart : BarChart;

  return (
    <div className="animate-fade-in-up rounded-3xl border border-white/10 bg-surface/60 p-6 backdrop-blur-xl">
      <p className="mb-4 font-mono text-xs uppercase tracking-wide text-mist">
        {columns[yIdx]} by {columns[xIdx]}
      </p>
      <ResponsiveContainer width="100%" height={340}>
        <Chart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#9A96A8" }}
            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#9A96A8" }}
            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            tickLine={false}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
            }
          />
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Tooltip content={<ChartTooltip /> as any} />
          {shape === "bar" ? (
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={52}>
              {data.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
              ))}
            </Bar>
          ) : (
            <Line
              type="monotone"
              dataKey="value"
              stroke="#F2B84B"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#F2B84B", stroke: "#0B0B10", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#8B5CF6" }}
            />
          )}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Data table ────────────────────────────────────────────────── */

function DataTable({ columns, rows }: Props) {
  function downloadCsv() {
    const header = columns.join(",");
    const csvRows = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","));
    const csvStr = [header, ...csvRows].join("\n");
    const blob = new Blob([csvStr], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "query_results.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadJson() {
    const jsonArr = rows.map((r) => {
      const obj: any = {};
      columns.forEach((c, i) => (obj[c] = r[i]));
      return obj;
    });
    const blob = new Blob([JSON.stringify(jsonArr, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "query_results.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end gap-2">
        <button
          onClick={downloadCsv}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] text-mist transition hover:bg-white/10 hover:text-white"
        >
          ↓ CSV
        </button>
        <button
          onClick={downloadJson}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] text-mist transition hover:bg-white/10 hover:text-white"
        >
          ↓ JSON
        </button>
      </div>
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="border-b border-white/5 bg-white/[0.02] px-6 py-4">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/8 bg-white/[0.02]">
              {columns.map((col) => (
                <th key={col} className="px-5 py-3 font-mono text-xs uppercase tracking-wide text-gold">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="animate-fade-in-up border-t border-white/8 transition-colors hover:bg-white/[0.03] first:border-t-0"
                style={{ animationDelay: `${0.04 * i}s` }}
              >
                {row.map((cell, j) => (
                  <td key={j} className="px-5 py-3 text-ink">
                    {cell === null ? <span className="text-mist/40 italic">null</span> : String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <p className="px-5 py-8 text-center text-sm text-mist">Query ran successfully — no rows returned.</p>
      )}
      </div>
    </div>
  );
}

/* ─── Main export ───────────────────────────────────────────────── */

export default function ResultViz({ columns, rows }: Props) {
  const shape = detectShape(columns, rows);

  switch (shape) {
    case "metric":
      return <MetricCard label={columns[0]} value={Number(rows[0][0])} />;
    case "bar":
    case "line":
      return <ChartViz shape={shape} columns={columns} rows={rows} />;
    case "table":
    default:
      return <DataTable columns={columns} rows={rows} />;
  }
}
