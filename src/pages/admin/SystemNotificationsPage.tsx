import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "../../lib/api/providers";
import { api } from "../../lib/api/client";
import {
  subscribeToPushNotifications,
  getPushSubscriptionState,
} from "../../lib/notifications/pushService";
import { testNotificationSound } from "../../lib/notifications/sound";
import InlineLoader, {
  ButtonLoader,
} from "../../components/shared/InlineLoader";

type NotificationType = "success" | "warning" | "danger" | string;
type PushState = "subscribed" | "denied" | "prompt" | "unsupported" | "ios_browser";

function typeConfig(type: NotificationType) {
  switch (type) {
    case "success":
      return { Icon: CheckCircle2, label: "Success", text: "text-emerald-700", tile: "bg-emerald-50 text-emerald-700" };
    case "warning":
      return { Icon: AlertCircle, label: "Warning", text: "text-amber-700", tile: "bg-amber-50 text-amber-700" };
    case "danger":
      return { Icon: AlertCircle, label: "Critical", text: "text-red-600", tile: "bg-red-50 text-red-600" };
    default:
      return { Icon: Info, label: type || "System", text: "text-blue-700", tile: "bg-blue-50 text-blue-700" };
  }
}

function parseData(raw: unknown) {
  if (!raw) return null;
  if (typeof raw === "object") return raw as Record<string, unknown>;
  try {
    return JSON.parse(String(raw)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function formatDate(value: unknown, detailed = false) {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "Unknown date";

  return date.toLocaleString(
    [],
    detailed
      ? { weekday: "short", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }
      : { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" },
  );
}

const outlineBtn =
  "inline-flex h-9 items-center gap-2 rounded border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50";

export default function SystemNotificationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any>(null);
  const limit = 10;

  const { data, isLoading, isFetching } = useQuery<any>({
    queryKey: ["admin-notifications", { search, page, limit }],
    queryFn: async () => {
      const res = await adminApi.getNotifications({ search, page, limit });
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteNotification(id),
    onSuccess: () => {
      toast.success("Notification deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      setSelected(null);
    },
    onError: () => toast.error("Failed to delete notification"),
  });

  const items = data?.items ?? [];
  const total = Number(data?.pagination?.total ?? 0);
  const pages = Number(data?.pagination?.pages ?? 1);

  const unreadCount = useMemo(() => items.filter((item: any) => !item.isRead).length, [items]);
  const dangerCount = useMemo(() => items.filter((item: any) => item.type === "danger").length, [items]);

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this notification permanently?")) {
      deleteMutation.mutate(id);
    }
  };

  const [pushState, setPushState] = useState<PushState>("prompt");
  const [pushLoading, setPushLoading] = useState(false);
  const [testSending, setTestSending] = useState(false);

  useEffect(() => {
    getPushSubscriptionState()
      .then((s) => setPushState(s as any))
      .catch(() => setPushState("prompt"));
  }, []);

  const handleEnablePush = async () => {
    setPushLoading(true);
    try {
      await subscribeToPushNotifications();
      toast.success("Push alerts enabled");
      const newState = await getPushSubscriptionState();
      setPushState(newState as any);
    } catch (err: any) {
      toast.error(err.message || "Failed to enable notifications");
    } finally {
      setPushLoading(false);
    }
  };

  const handleSendTestPush = async () => {
    setTestSending(true);
    try {
      testNotificationSound();
      await api.post("/notifications/test");
      toast.success("Test alert sent");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send test alert");
    } finally {
      setTestSending(false);
    }
  };

  const handleTestTone = async () => {
    try {
      await testNotificationSound();
      toast.success("Playing notification tone");
    } catch (_) {
      toast.error("Unable to play tone");
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    setSelected(null);
  };

  const pushCopy =
    pushState === "subscribed"
      ? { dot: "bg-emerald-500", title: "Push alerts are on", body: "You get alerts for payments, signups and system problems, even when this portal is closed." }
      : pushState === "denied"
        ? { dot: "bg-amber-500", title: "Notifications are blocked in this browser", body: "Allow notifications from the site settings in your address bar, then reload." }
        : pushState === "unsupported"
          ? { dot: "bg-slate-400", title: "Push alerts aren't supported here", body: "This browser can't receive push notifications." }
          : pushState === "ios_browser"
            ? { dot: "bg-amber-500", title: "Add this site to your Home Screen", body: "On iPhone, push alerts only work once the portal is added to the Home Screen." }
            : { dot: "bg-slate-400", title: "Push alerts are off", body: "Turn them on to get instant alerts, even when this portal is closed." };

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 pt-2 animate-in fade-in duration-500">
      {/* Header */}
      <header className="border-b border-slate-200 pb-6">
        <p className="text-xs text-slate-500">
          {total} {total === 1 ? "notification" : "notifications"}
        </p>
        <h1 className="mt-1 font-serif text-3xl tracking-tight text-slate-900">System notifications</h1>
      </header>

      {/* Figures */}
      <dl className="grid grid-cols-3 divide-x divide-slate-200 overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="p-5 sm:p-6">
          <dt className="text-sm text-slate-500">On this page</dt>
          <dd className="mt-1 font-serif text-2xl tabular-nums text-slate-900 sm:text-3xl">{items.length}</dd>
        </div>
        <div className="p-5 sm:p-6">
          <dt className="text-sm text-slate-500">Unread</dt>
          <dd className="mt-1 font-serif text-2xl tabular-nums text-slate-900 sm:text-3xl">{unreadCount}</dd>
        </div>
        <div className="p-5 sm:p-6">
          <dt className="text-sm text-slate-500">Critical</dt>
          <dd className={`mt-1 font-serif text-2xl tabular-nums sm:text-3xl ${dangerCount > 0 ? "text-red-600" : "text-slate-900"}`}>
            {dangerCount}
          </dd>
        </div>
      </dl>

      {/* Push alerts */}
      <section className="flex flex-col gap-4 rounded-md border border-slate-200 bg-white px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${pushCopy.dot}`} />
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{pushCopy.title}</h2>
            <p className="mt-0.5 max-w-xl text-sm text-slate-500">{pushCopy.body}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleTestTone} className={outlineBtn}>
            Play tone
          </button>
          {pushState === "subscribed" ? (
            <button onClick={handleSendTestPush} disabled={testSending} className={outlineBtn}>
              {testSending && <ButtonLoader size={12} />}
              Send test alert
            </button>
          ) : (
            <button
              onClick={handleEnablePush}
              disabled={pushLoading || pushState === "unsupported"}
              className="inline-flex h-9 items-center gap-2 rounded bg-[#0D4A3E] px-3 text-sm font-medium text-white transition-colors hover:bg-[#0A3D33] disabled:opacity-50"
            >
              {pushLoading && <ButtonLoader size={12} />}
              Enable push alerts
            </button>
          )}
          <Link to="/admin/settings" className="px-2 text-sm font-medium text-[#0D4A3E] hover:underline">
            Settings
          </Link>
        </div>
      </section>

      {/* Feed + detail */}
      <div className={`grid gap-6 ${selected ? "xl:grid-cols-[minmax(0,1fr)_380px]" : "grid-cols-1"}`}>
        <section className="min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Activity</h2>
            <div className="flex items-center gap-3">
              {isFetching && !isLoading && (
                <span className="flex items-center gap-2 text-xs text-slate-400">
                  <ButtonLoader size={12} /> Updating
                </span>
              )}
              <label className="relative block w-full sm:w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search notifications, shops or owners"
                  className="w-full rounded border border-slate-300 bg-white py-2 pl-8 pr-8 text-sm outline-none placeholder:text-slate-400 focus:border-[#0D4A3E]"
                />
                {search && (
                  <button
                    onClick={() => handleSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </label>
            </div>
          </div>

          <div className="min-h-[360px]">
            {isLoading ? (
              <div className="flex min-h-[360px] items-center justify-center">
                <InlineLoader size="lg" message="Loading activity..." />
              </div>
            ) : items.length === 0 ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
                <p className="text-sm font-medium text-slate-700">
                  {search ? "No notifications match your search" : "No notifications yet"}
                </p>
                <p className="mt-1 max-w-sm text-sm text-slate-400">
                  {search
                    ? "Try a different search term."
                    : "System and business alerts will appear here as activity is recorded."}
                </p>
                {search && (
                  <button onClick={() => handleSearch("")} className="mt-3 text-sm font-medium text-[#0D4A3E] hover:underline">
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {items.map((item: any) => {
                  const cfg = typeConfig(item.type);
                  const Icon = cfg.Icon;
                  const active = selected?.id === item.id;

                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(active ? null : item)}
                        className={`group flex w-full items-start gap-3 border-l-2 px-6 py-4 text-left transition-colors ${
                          active
                            ? "border-l-[#0D4A3E] bg-slate-50"
                            : "border-l-transparent hover:bg-slate-50"
                        }`}
                      >
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded ${cfg.tile}`}>
                          <Icon size={16} />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className={`truncate text-sm text-slate-900 ${item.isRead ? "font-medium" : "font-semibold"}`}>
                              {item.title}
                            </span>
                            {!item.isRead && (
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" title="Unread" />
                            )}
                          </span>
                          <span className="mt-0.5 line-clamp-2 block text-sm text-slate-500">{item.message}</span>
                          <span className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                            <span className={`font-medium ${cfg.text}`}>{cfg.label}</span>
                            {item.shopName && <span>{item.shopName}</span>}
                            <span className="tabular-nums">{formatDate(item.createdAt)}</span>
                          </span>
                        </span>

                        <ChevronRight
                          size={16}
                          className={`mt-2 shrink-0 transition-transform ${
                            active ? "rotate-90 text-[#0D4A3E]" : "text-slate-300 group-hover:text-slate-500"
                          }`}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 text-xs text-slate-500">
              <span className="tabular-nums">
                {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1 || isFetching}
                  onClick={() => {
                    setPage((p) => p - 1);
                    setSelected(null);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="min-w-10 text-center tabular-nums">
                  {page} / {pages}
                </span>
                <button
                  disabled={page >= pages || isFetching}
                  onClick={() => {
                    setPage((p) => p + 1);
                    setSelected(null);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Desktop detail panel */}
        {selected && (
          <aside className="hidden h-fit overflow-hidden rounded-md border border-slate-200 bg-white xl:sticky xl:top-4 xl:block">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <h2 className="text-sm font-semibold text-slate-900">Details</h2>
              <button
                onClick={() => setSelected(null)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close details"
              >
                <X size={16} />
              </button>
            </div>
            <NotificationDetail item={selected} onDelete={handleDelete} deleting={deleteMutation.isPending} />
          </aside>
        )}
      </div>

      {/* Mobile bottom sheet */}
      {selected && (
        <div className="xl:hidden">
          <div className="fixed inset-0 z-40 bg-black/40 animate-fadeIn" onClick={() => setSelected(null)} />
          <div
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-xl border-t border-slate-200 bg-white shadow-2xl animate-slideUp"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <h2 className="text-sm font-semibold text-slate-900">Details</h2>
              <button
                onClick={() => setSelected(null)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close details"
              >
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto">
              <NotificationDetail item={selected} onDelete={handleDelete} deleting={deleteMutation.isPending} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationDetail({
  item,
  onDelete,
  deleting,
}: {
  item: any;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const cfg = typeConfig(item.type);
  const Icon = cfg.Icon;
  const payload = parseData(item.data);
  const entries = payload ? Object.entries(payload).filter(([key]) => key !== "url") : [];
  const url = payload?.url;

  return (
    <div className="space-y-6 p-5">
      <div className="flex items-start gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded ${cfg.tile}`}>
          <Icon size={18} />
        </span>
        <div className="min-w-0">
          <p className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</p>
          <h3 className="mt-0.5 font-serif text-lg leading-snug text-slate-900">{item.title}</h3>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-slate-700">{item.message}</p>

      <dl className="divide-y divide-slate-100 border-y border-slate-200 text-sm">
        {item.shopName && (
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-slate-500">Business</dt>
            <dd className="text-right font-medium text-slate-900">{item.shopName}</dd>
          </div>
        )}
        {item.shopOwnerName && (
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-slate-500">Owner</dt>
            <dd className="text-right text-slate-900">{item.shopOwnerName}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4 py-3">
          <dt className="text-slate-500">Received</dt>
          <dd className="text-right tabular-nums text-slate-900">{formatDate(item.createdAt, true)}</dd>
        </div>
        <div className="flex justify-between gap-4 py-3">
          <dt className="text-slate-500">Status</dt>
          <dd className="inline-flex items-center gap-2 text-slate-900">
            <span className={`h-2 w-2 rounded-full ${item.isRead ? "bg-slate-400" : "bg-amber-500"}`} />
            {item.isRead ? "Read" : "Unread"}
          </dd>
        </div>
        {url != null && (
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-slate-500">Link</dt>
            <dd className="break-all text-right text-blue-700">{String(url)}</dd>
          </div>
        )}
        {entries.map(([key, value]) => (
          <div key={key} className="flex justify-between gap-4 py-3">
            <dt className="text-slate-500">{key}</dt>
            <dd className="break-all text-right text-slate-900">
              {value === null ? "null" : typeof value === "object" ? (JSON.stringify(value) ?? "") : String(value)}
            </dd>
          </div>
        ))}
      </dl>

      <button
        onClick={() => onDelete(item.id)}
        disabled={deleting}
        className="flex h-10 w-full items-center justify-center gap-2 rounded border border-red-200 bg-white text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
      >
        {deleting ? <ButtonLoader size={14} /> : <Trash2 size={14} />}
        Delete notification
      </button>
    </div>
  );
}