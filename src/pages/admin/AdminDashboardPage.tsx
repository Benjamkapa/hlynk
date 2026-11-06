import { useState, useEffect } from "react";
import { FileSpreadsheet, ArrowUpRight } from "lucide-react";
import InlineLoader, {
  ButtonLoader,
} from "../../components/shared/InlineLoader";
import {
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/providers";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import Pagination from "../../components/shared/Pagination";

// Flip to true to show the Excel export button in the header
const SHOW_EXPORT = false;

const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const kes = (n: any) => Number(n || 0).toLocaleString();
const clock = (t: any) =>
  t
    ? new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

export default function AdminDashboardPage() {
  const [timeframe, setTimeframe] = useState<"HOURLY" | "DAILY">("HOURLY");
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportDossier = async () => {
    setIsExporting(true);
    const toastId = toast.loading(
      "Compiling multi-sheet intelligence report...",
    );
    try {
      await adminApi.downloadPlatformReport();
      toast.success("Platform intelligence report downloaded (.xlsx)", {
        id: toastId,
      });
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to export platform report", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const {
    data: rawStats,
    isLoading,
    error,
  } = useQuery<any>({
    queryKey: ["admin-stats-", timeframe],
    queryFn: () => adminApi.getStats(timeframe),
  });

  const { data: healthData } = useQuery({
    queryKey: ["system-health"],
    queryFn: () => adminApi.getHealth(),
    refetchInterval: 30000,
  });

  const stats = rawStats?.data || rawStats;
  const health = healthData?.data || healthData;

  useEffect(() => {
    if (error) toast.error("Failed to load system stats");
  }, [error]);

  const revenueData = stats?.trends?.revenueTrend || [];
  const recentEvents =
    stats?.recentActivity?.map((a: any) => ({
      event: a?.event || "Activity",
      entity: a?.entity || "System",
      user: a?.user || "System",
      time: a?.time,
      severity:
        a?.event &&
        (a.event.toLowerCase().includes("delete") ||
          a.event.toLowerCase().includes("error"))
          ? "High"
          : "Normal",
    })) || [];

  const transactions: any[] = stats?.recentTransactions || [];
  const dbUp = health?.database === "up";
  const activeAvatars: any[] = stats?.overview?.activeAvatars || [];
  const activeToday = stats?.overview?.activeToday || 0;

  if (isLoading)
    return (
      <div className="flex h-96 items-center justify-center">
        <InlineLoader size="lg" message="Loading dashboard overview..." />
      </div>
    );

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 pt-2 animate-in fade-in duration-500">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-slate-500">{today}</p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight text-slate-900">
            Platform overview
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          {activeToday > 0 || activeAvatars.length > 0 ? (
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {activeAvatars.slice(0, 4).map((u: any, i: number) => (
                  <img
                    key={i}
                    src={u.photoUrl}
                    title={u.name}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-7 w-7 rounded-full border-2 border-white bg-slate-100 object-cover"
                  />
                ))}
              </div>
              <span className="text-xs text-slate-600">
                <span className="font-semibold text-slate-900">
                  {activeToday}
                </span>{" "}
                active today
              </span>
            </div>
          ) : null}

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span
              className={`h-2 w-2 rounded-full ${dbUp ? "bg-emerald-500" : "bg-red-500"}`}
            />
            {dbUp ? "All systems operational" : "Degraded performance"}
          </div>

          {SHOW_EXPORT && (
            <button
              onClick={handleExportDossier}
              disabled={isExporting}
              className="flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              {isExporting ? (
                <ButtonLoader size="sm" />
              ) : (
                <FileSpreadsheet size={14} />
              )}
              {isExporting ? "Exporting..." : "Export report"}
            </button>
          )}
        </div>
      </header>

      <section className="grid grid-cols-3 overflow-hidden rounded-md border border-slate-200 bg-white xl:grid-cols-12">
        {/* Revenue */}
        <div className="col-span-3 bg-[#0D4A3E] p-6 text-white sm:p-8 xl:col-span-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-emerald-100/70">
                Subscription revenue
              </p>
              <p className="mt-2 font-serif text-4xl tabular-nums tracking-tight sm:text-5xl">
                <span className="mr-2 text-xl text-emerald-100/60">KES</span>
                {kes(stats?.revenue?.total)}
              </p>
            </div>

            <div className="flex gap-5 text-sm">
              {(["HOURLY", "DAILY"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`border-b pb-1 transition-colors ${
                    timeframe === tf
                      ? "border-emerald-300 text-white"
                      : "border-transparent text-emerald-100/50 hover:text-emerald-100"
                  }`}
                >
                  {tf === "HOURLY" ? "Hourly" : "Daily"}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 h-[280px] w-full">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              debounce={100}
            >
              <AreaChart
                data={revenueData}
                margin={{ top: 8, right: 4, left: -12, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6EE7B7" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#6EE7B7" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  vertical={false}
                  stroke="rgba(255,255,255,0.08)"
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "rgba(209,250,229,0.55)" }}
                  dy={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "rgba(209,250,229,0.55)" }}
                  tickFormatter={(v) => compact.format(v)}
                  width={48}
                />

                <Tooltip
                  cursor={{
                    stroke: "rgba(255,255,255,0.25)",
                    strokeWidth: 1,
                  }}
                  content={<ChartTooltip />}
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6EE7B7"
                  strokeWidth={1.75}
                  fill="url(#revFill)"
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "#0D4A3E",
                    stroke: "#6EE7B7",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key figures */}
        <dl className="col-span-3 grid grid-cols-3 divide-x divide-slate-200 xl:col-span-4 xl:grid-cols-1 xl:divide-x-0 xl:divide-y">
          <Figure
            label="Gross merchandise volume"
            value={`KES ${kes(stats?.revenue?.platformVolume)}`}
            note="Total sales processed on the platform"
          />

          <Figure
            label="Paybill collections"
            value={`KES ${kes(stats?.revenue?.mpesaCollections)}`}
            note="M-Pesa inflow through the system paybill"
          />

          <Figure
            label="Businesses"
            value={String(stats?.overview?.totalProviders || 0)}
            note={`${stats?.overview?.payingProviders || 0} on a paid subscription`}
          />
        </dl>
      </section>

      {/* ── Ledger + operations ────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        {/* Ledger */}
        <section className="overflow-hidden rounded-md border border-slate-200 bg-white xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Recent transactions
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Platform-wide, most recent first
              </p>
            </div>
            <Link
              to="/admin/forensic-audit"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#0D4A3E] hover:underline"
            >
              Full audit <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="px-6 py-3 font-medium">Reference</th>
                  <th className="px-6 py-3 font-medium">Business</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.length > 0 ? (
                  transactions
                    .slice((page - 1) * 5, page * 5)
                    .map((tx: any, i: number) => (
                      <tr
                        key={i}
                        className="transition-colors hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 text-xs text-slate-600 hl-mono">
                          {tx.id}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-900">
                            {tx.entity}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {tx.user}
                            {tx.status ? (
                              <span className="text-slate-300"> · </span>
                            ) : null}
                            {tx.status}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2 text-xs text-slate-700">
                            <span
                              className={`h-1.5 w-1.5 rounded-sm ${
                                tx.type === "SALE"
                                  ? "bg-emerald-500"
                                  : "bg-sky-500"
                              }`}
                            />
                            {tx.type === "SALE"
                              ? "Sale"
                              : String(tx.type || "").charAt(0) +
                                String(tx.type || "")
                                  .slice(1)
                                  .toLowerCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm font-medium tabular-nums text-slate-900">
                            {tx.amount > 0
                              ? `KES ${tx.amount.toLocaleString()}`
                              : "—"}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {clock(tx.time)}
                          </p>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-16 text-center text-sm text-slate-400"
                    >
                      No transactions in the current window.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {transactions.length > 5 && (
            <div className="border-t border-slate-200 px-6 py-4">
              <Pagination
                page={page}
                pages={Math.ceil(transactions.length / 5)}
                total={transactions.length}
                onPageChange={setPage}
                label="Transaction"
              />
            </div>
          )}
        </section>

        {/* Operations column */}
        <div className="space-y-8">
          {/* System status */}
          <section className="rounded-md border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                System status
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Refreshes every 30 seconds
              </p>
            </div>
            <dl className="divide-y divide-slate-100 px-6">
              <StatusRow
                label="Database"
                value={dbUp ? "Online" : "Degraded"}
                tone={dbUp ? "ok" : "bad"}
              />
              <StatusRow
                label="Latency"
                value={health?.dbLatency || "—"}
                mono
              />
              <StatusRow
                label="Memory"
                value={health?.memoryUsage || "—"}
                mono
              />
              <StatusRow
                label="Errors, last 24h"
                value={String(health?.errorsLast24h || 0)}
                tone={health?.errorsLast24h > 0 ? "warn" : undefined}
                mono
              />
            </dl>
          </section>

          {/* Activity */}
          <section className="rounded-md border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Recent activity
              </h2>
            </div>
            {recentEvents.length > 0 ? (
              <ol className="relative px-6 py-5">
                <span className="absolute bottom-7 left-[27px] top-7 w-px bg-slate-200" />
                {recentEvents.slice(0, 4).map((ev: any, i: number) => (
                  <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
                    <span
                      className={`relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-white ring-1 ${
                        ev.severity === "High"
                          ? "bg-red-500 ring-red-200"
                          : "bg-slate-400 ring-slate-200"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {ev.event}
                        </p>
                        <span className="shrink-0 text-xs text-slate-400">
                          {clock(ev.time)}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {ev.entity} · {ev.user}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="px-6 py-10 text-center text-sm text-slate-400">
                No recent activity.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Figure({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="p-6 sm:p-8">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-2 font-serif text-2xl tabular-nums tracking-tight text-slate-900 sm:text-3xl">
        {value}
      </dd>
      <p className="mt-1.5 text-xs text-slate-500">{note}</p>
    </div>
  );
}

function StatusRow({
  label,
  value,
  tone,
  mono,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn" | "bad";
  mono?: boolean;
}) {
  const color =
    tone === "ok"
      ? "text-emerald-700"
      : tone === "warn"
        ? "text-amber-600"
        : tone === "bad"
          ? "text-red-600"
          : "text-slate-900";
  return (
    <div className="flex items-center justify-between py-3.5">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className={`text-sm font-medium ${color} ${mono ? "hl-mono" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded bg-white px-3 py-2 text-xs shadow-lg">
      <p className="text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">
        KES {Number(payload[0].value).toLocaleString()}
      </p>
    </div>
  );
}
