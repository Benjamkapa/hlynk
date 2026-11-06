import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/providers";
import { toast } from "sonner";
import { Search, Download, ArrowUp, ArrowDown } from "lucide-react";
import { AdminStats } from "../../lib/types/api";
import Pagination from "../../components/shared/Pagination";
import InlineLoader from "../../components/shared/InlineLoader";
import PayoutsManager from "../../components/admin/PayoutsManager";

type SortField =
  | "id"
  | "createdAt"
  | "businessName"
  | "amount"
  | "type"
  | "status";
type SortDirection = "asc" | "desc";
type StatusLabel = "Completed" | "Processing" | "Failed";

const PAGE_SIZE = 10;

const COLUMNS: { field: SortField; label: string; right?: boolean }[] = [
  { field: "createdAt", label: "Date" },
  { field: "businessName", label: "Business" },
  { field: "id", label: "Reference" },
  { field: "type", label: "Type" },
  { field: "amount", label: "Amount", right: true },
  { field: "status", label: "Status" },
];

const getStatus = (status: any): StatusLabel => {
  if (status === 0 || status === "Completed" || status === "Success")
    return "Completed";
  if (status === 1 || status === "Processing" || status === "Pending")
    return "Processing";
  return "Failed";
};

const STATUS_STYLE: Record<StatusLabel, { text: string; dot: string }> = {
  Completed: { text: "text-emerald-700", dot: "bg-emerald-500" },
  Processing: { text: "text-blue-700", dot: "bg-blue-500" },
  Failed: { text: "text-red-600", dot: "bg-red-500" },
};

const formatDateParts = (dateStr: string) => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { day: "N/A", time: "" };
  return {
    day: d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
  };
};

const formatTypeLabel = (type: any) => {
  const s = (type || "Payment").toString().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const kes = (n: any) => Number(n || 0).toLocaleString();
const csvCell = (v: any) => `"${(v ?? "").toString().replace(/"/g, '""')}"`;

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<"ledger" | "payouts">("ledger");
  const [ledgerPage, setLedgerPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const {
    data: rawStats,
    isLoading: statsLoading,
    error,
  } = useQuery<any>({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.getStats(),
  });

  useEffect(() => {
    if (error) toast.error("Failed to load transaction data");
  }, [error]);

  const stats: AdminStats = rawStats?.data || rawStats;
  const s: any = stats;
  const pendingCount = Number(s?.pendingPayoutsCount || 0);

  const sortedTransactions = useMemo(() => {
    const raw: any[] = s?.recentTransactions || [];
    return [...raw].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (sortField === "amount") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      if (sortField === "createdAt") {
        return sortDirection === "asc"
          ? new Date(aValue).getTime() - new Date(bValue).getTime()
          : new Date(bValue).getTime() - new Date(aValue).getTime();
      }

      aValue = aValue.toString().toLowerCase();
      bValue = bValue.toString().toLowerCase();

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [s, sortField, sortDirection]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sortedTransactions.filter((t: any) => {
      if (status && getStatus(t.status) !== status) return false;
      if (!q) return true;
      return [t.id, t.businessName, t.type].some((v) =>
        v?.toString().toLowerCase().includes(q),
      );
    });
  }, [sortedTransactions, search, status]);

  const pageRows = useMemo(() => {
    const start = (ledgerPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, ledgerPage]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const isFiltered = !!(search || status);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const exportCsv = () => {
    if (filtered.length === 0) {
      toast.error("There are no transactions to export");
      return;
    }
    const header = [
      "Reference",
      "Date",
      "Business",
      "Type",
      "Amount (KES)",
      "Status",
    ];
    const rows = filtered.map((t: any) => [
      t.id,
      isNaN(new Date(t.createdAt).getTime())
        ? ""
        : new Date(t.createdAt).toISOString(),
      t.businessName || "System",
      formatTypeLabel(t.type),
      t.amount ?? 0,
      getStatus(t.status),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map(csvCell).join(","))
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 pt-2 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-slate-500">
            {pendingCount === 1
              ? "1 vendor transfer"
              : `${pendingCount} vendor transfers`}{" "}
            awaiting settlement
          </p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight text-slate-900">
            Treasury
          </h1>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex h-10 items-center gap-2 rounded border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <Download size={16} /> Export ledger
        </button>
      </header>

      {/* Settlement + figures */}
      <section className="grid grid-cols-3 overflow-hidden rounded-md border border-slate-200 bg-white xl:grid-cols-12">
        {/* Pending payouts */}
        <div className="col-span-3 flex flex-col justify-between gap-8 bg-[#0D4A3E] p-6 text-white sm:p-8 xl:col-span-7">
          <div>
            <p className="text-sm text-emerald-100/70">Awaiting settlement</p>

            <p className="mt-2 font-serif text-4xl tabular-nums tracking-tight sm:text-5xl">
              <span className="mr-2 text-xl text-emerald-100/60 sm:text-2xl">
                KES
              </span>
              {kes(s?.pendingPayoutsAmount)}
            </p>
          </div>

          <div>
            <button
              onClick={() => setActiveTab("payouts")}
              className="inline-flex h-10 items-center rounded bg-white px-4 text-sm font-medium text-[#0D4A3E] transition-colors hover:bg-emerald-50"
            >
              Review payouts
            </button>
          </div>
        </div>

        {/* Key figures */}
        <dl className="col-span-3 grid grid-cols-3 divide-x divide-slate-200 xl:col-span-5 xl:grid-cols-1 xl:divide-x-0 xl:divide-y">
          <div className="min-w-0 p-3 sm:p-6 xl:p-8">
            <dt className="text-xs text-slate-500 sm:text-sm">
              Volume, last 24 hours
            </dt>
            <dd className="mt-2 break-words font-serif text-xl tabular-nums tracking-tight text-slate-900 sm:text-3xl">
              KES {kes(s?.totalVolume24h)}
            </dd>
          </div>

          <div className="min-w-0 p-3 sm:p-6 xl:p-8">
            <dt className="text-xs text-slate-500 sm:text-sm">
              Payment success rate
            </dt>
            <dd className="mt-2 break-words font-serif text-xl tabular-nums tracking-tight text-slate-900 sm:text-3xl">
              {s?.successRate || 0}%
            </dd>
          </div>

          <div className="min-w-0 p-3 sm:p-6 xl:p-8">
            <dt className="text-xs text-slate-500 sm:text-sm">
              Revenue this month, after payouts
            </dt>
            <dd className="mt-2 break-words font-serif text-xl tabular-nums tracking-tight text-slate-900 sm:text-3xl">
              KES {kes(s?.overview?.revenueThisMonth)}
            </dd>
          </div>
        </dl>
      </section>

      {/* Tabs */}
      <div
        className="flex gap-6 border-b border-slate-200"
        role="tablist"
        aria-label="Treasury sections"
      >
        {(["ledger", "payouts"] as const).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`-mb-px border-b-2 pb-3 text-sm transition-colors ${
              activeTab === tab
                ? "border-[#0D4A3E] font-semibold text-slate-900"
                : "border-transparent font-medium text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab === "ledger" ? "Ledger" : "Payouts"}
          </button>
        ))}
      </div>

      {activeTab === "ledger" ? (
        <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              All transactions
            </h2>
            <div className="flex flex-wrap gap-2">
              <label className="relative block w-full sm:w-64">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search business, reference or type"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setLedgerPage(1);
                  }}
                  className="w-full rounded border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#0D4A3E]"
                />
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setLedgerPage(1);
                }}
                className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0D4A3E]"
              >
                <option value="">All statuses</option>
                <option value="Completed">Completed</option>
                <option value="Processing">Processing</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  {COLUMNS.map((c) => {
                    const active = sortField === c.field;
                    return (
                      <th
                        key={c.field}
                        scope="col"
                        aria-sort={
                          active
                            ? sortDirection === "asc"
                              ? "ascending"
                              : "descending"
                            : "none"
                        }
                        className={`px-6 py-3 font-medium ${c.right ? "text-right" : ""}`}
                      >
                        <button
                          onClick={() => handleSort(c.field)}
                          className={`inline-flex items-center gap-1.5 transition-colors hover:text-slate-900 ${
                            active ? "text-slate-900" : ""
                          }`}
                        >
                          {c.label}
                          {active &&
                            (sortDirection === "asc" ? (
                              <ArrowUp size={12} />
                            ) : (
                              <ArrowDown size={12} />
                            ))}
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {statsLoading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <InlineLoader message="Loading transactions..." />
                    </td>
                  </tr>
                ) : pageRows.length > 0 ? (
                  pageRows.map((t: any, i: number) => {
                    const st = getStatus(t.status);
                    const { day, time } = formatDateParts(t.createdAt);
                    const amount = Number(t.amount || 0);
                    const name = t.businessName || "System";
                    return (
                      <tr
                        key={t.id ?? i}
                        className="transition-colors hover:bg-slate-50"
                      >
                        <td className="px-6 py-3.5">
                          <p className="text-sm text-slate-900">{day}</p>
                          {time && (
                            <p className="text-xs tabular-nums text-slate-400">
                              {time}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-100 text-sm font-semibold text-slate-600">
                              {name.charAt(0).toUpperCase()}
                            </span>
                            <p className="truncate text-sm font-medium text-slate-900">
                              {name}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-xs text-slate-400 hl-mono">
                          {t.id?.toString().slice(-8).toUpperCase() || "N/A"}
                        </td>
                        <td className="px-6 py-3.5 text-sm text-slate-700">
                          {formatTypeLabel(t.type)}
                        </td>
                        <td
                          className={`whitespace-nowrap px-6 py-3.5 text-right text-sm font-medium tabular-nums ${
                            amount < 0 ? "text-red-600" : "text-emerald-700"
                          }`}
                        >
                          {amount > 0 ? "+" : amount < 0 ? "−" : ""}KES{" "}
                          {kes(Math.abs(amount))}
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-flex items-center gap-2 text-sm ${STATUS_STYLE[st].text}`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${STATUS_STYLE[st].dot}`}
                            />
                            {st}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-16 text-center text-sm text-slate-400"
                    >
                      {isFiltered
                        ? "No transactions match these filters."
                        : "Transactions will appear here once payments are processed."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 text-xs text-slate-500">
            <span>
              {filtered.length}{" "}
              {filtered.length === 1 ? "transaction" : "transactions"}
            </span>
            {isFiltered && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatus("");
                  setLedgerPage(1);
                }}
                className="font-medium text-[#0D4A3E] hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>

          {totalPages > 1 && (
            <div className="border-t border-slate-200 px-6 py-4">
              <Pagination
                page={ledgerPage}
                pages={totalPages}
                total={filtered.length}
                onPageChange={setLedgerPage}
                label="Transaction"
              />
            </div>
          )}
        </section>
      ) : (
        <PayoutsManager />
      )}
    </div>
  );
}
