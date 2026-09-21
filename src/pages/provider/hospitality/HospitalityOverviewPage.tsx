import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck, Building, TrendingUp, Wallet, Clock, Sparkles,
  Plus, RefreshCw, Loader2, Users, ArrowRight, WifiOff
} from "lucide-react";
import { resourcesApi, eventsApi, operationsApi, Resource, UniversalEvent, OperationTask } from "../../../lib/api/universal";
import { toast } from "sonner";

const STATUS_DOT: Record<string, string> = {
  AVAILABLE:   "bg-emerald-500",
  OCCUPIED:    "bg-blue-500",
  CLEANING:    "bg-purple-400",
  MAINTENANCE: "bg-amber-400",
  RESERVED:    "bg-slate-400",
};

const STATUS_LABEL: Record<string, string> = {
  AVAILABLE:   "Available",
  OCCUPIED:    "Occupied",
  CLEANING:    "Cleaning",
  MAINTENANCE: "Maintenance",
  RESERVED:    "Reserved",
};

export default function HospitalityOverviewPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [events, setEvents] = useState<UniversalEvent[]>([]);
  const [operations, setOperations] = useState<OperationTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const fetchData = async () => {
    setLoading(true);
    const offlineNow = typeof navigator !== "undefined" && !navigator.onLine;
    setIsOffline(offlineNow);

    if (offlineNow) {
      const cRes = localStorage.getItem("hlynk_cached_resources");
      const cEvt = localStorage.getItem("hlynk_cached_events");
      const cOps = localStorage.getItem("hlynk_cached_operations");
      if (cRes) setResources(JSON.parse(cRes));
      if (cEvt) setEvents(JSON.parse(cEvt));
      if (cOps) setOperations(JSON.parse(cOps));
      setLoading(false);
      return;
    }

    try {
      const [resData, evtData, opData] = await Promise.all([
        resourcesApi.getResources({}),
        eventsApi.getEvents({ eventType: "BOOKING" }),
        operationsApi.getOperations(),
      ]);
      setResources(resData);
      setEvents(evtData);
      setOperations(opData);
      localStorage.setItem("hlynk_cached_resources", JSON.stringify(resData));
      localStorage.setItem("hlynk_cached_events", JSON.stringify(evtData));
      localStorage.setItem("hlynk_cached_operations", JSON.stringify(opData));
    } catch (err: any) {
      const cRes = localStorage.getItem("hlynk_cached_resources");
      const cEvt = localStorage.getItem("hlynk_cached_events");
      const cOps = localStorage.getItem("hlynk_cached_operations");
      if (cRes) setResources(JSON.parse(cRes));
      if (cEvt) setEvents(JSON.parse(cEvt));
      if (cOps) setOperations(JSON.parse(cOps));
      if (navigator.onLine) {
        toast.error("Failed to load data", { description: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const units = resources.filter(r => r.type !== "PROPERTY");
  const totalUnits = units.length;
  const occupiedUnits = units.filter(r => r.status === "OCCUPIED").length;
  const availableUnits = units.filter(r => r.status === "AVAILABLE").length;
  const utilizationRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  const totalRevenue = events.reduce((sum, e) => sum + (Number(e.paidAmount) || 0), 0);
  const pendingBalances = events.reduce((sum, e) => sum + (Number(e.balance) || 0), 0);
  const activeBookings = events.filter(e => e.status === "CONFIRMED" || e.status === "CHECKED_IN");
  const pendingTasks   = operations.filter(o => o.status === "PENDING" || o.status === "IN_PROGRESS");

  return (
    <div className="space-y-8 pt-4">
      {/* Offline Banner */}
      {isOffline && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-medium text-amber-800">
          <WifiOff size={15} className="text-amber-600 shrink-0" />
          <span>Offline Mode: Operating with cached hospitality data.</span>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between py-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time hospitality dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={15} className={`text-slate-600 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            to="/dashboard/hospitality/bookings"
            className="flex items-center gap-1.5 bg-[#0D4A3E] text-white text-sm font-medium px-4 py-2.5 rounded-full hover:bg-[#0A3D33] transition-colors"
          >
            <Plus size={15} /> New booking
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Utilization", value: `${utilizationRate}%`, sub: `${occupiedUnits}/${totalUnits} units active`, color: "text-slate-900" },
          { label: "Revenue collected", value: `KES ${totalRevenue.toLocaleString()}`, sub: "Total paid in", color: "text-slate-900" },
          { label: "Pending balances", value: `KES ${pendingBalances.toLocaleString()}`, sub: "Uncollected", color: pendingBalances > 0 ? "text-amber-600" : "text-slate-900" },
          { label: "Open tasks", value: `${pendingTasks.length}`, sub: `${availableUnits} units available`, color: pendingTasks.length > 0 ? "text-amber-600" : "text-emerald-600" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-slate-100 rounded-2xl p-4">
            <p className="text-xs text-slate-500 font-medium">{kpi.label}</p>
            <p className={`text-xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 mb-6">
        {[
          { to: "/dashboard/hospitality/properties", label: "Units & Vehicles", sub: `${totalUnits} total`, icon: Building, color: "text-emerald-600" },
          { to: "/dashboard/hospitality/bookings",   label: "Bookings",         sub: `${activeBookings.length} active`, icon: CalendarCheck, color: "text-blue-600" },
          { to: "/dashboard/hospitality/operations", label: "Tasks",            sub: `${pendingTasks.length} pending`, icon: Sparkles, color: "text-purple-600" },
        ].map(({ to, label, sub, icon: Icon, color }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center justify-between bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-sm hover:border-slate-200 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center ${color}`}>
                <Icon size={17} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{label}</p>
                <p className="text-xs text-slate-500">{sub}</p>
              </div>
            </div>
            <ArrowRight size={15} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
          </Link>
        ))}
      </div>

      {/* Units status grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
        {/* Unit Status */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-900">Unit status</p>
            <span className="text-xs text-slate-400">{totalUnits} total</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="animate-spin text-slate-300" size={20} />
            </div>
          ) : units.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-slate-400">No units added yet</p>
              <Link to="/dashboard/hospitality/properties" className="text-xs font-medium text-slate-700 underline underline-offset-2 mt-1 block">
                Add your first unit
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {units.map((room) => (
                <div key={room.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[room.status] || "bg-slate-300"}`} />
                    <span className="text-sm text-slate-800 truncate">{room.title}</span>
                  </div>
                  <span className="text-xs text-slate-500 shrink-0 ml-2">
                    {STATUS_LABEL[room.status] || room.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Bookings */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-900">Active bookings</p>
            <Link to="/dashboard/hospitality/bookings" className="text-xs text-slate-500 hover:text-slate-700 font-medium">
              View all
            </Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="animate-spin text-slate-300" size={20} />
            </div>
          ) : activeBookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-slate-400">No active bookings</p>
              <Link to="/dashboard/hospitality/bookings" className="text-xs font-medium text-slate-700 underline underline-offset-2 mt-1 block">
                Create a booking
              </Link>
            </div>
          ) : (
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {activeBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {b.customerName || b.guestName || "Guest"}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{b.resourceTitle}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-slate-900">KES {Number(b.totalAmount).toLocaleString()}</p>
                    {Number(b.balance) > 0 ? (
                      <p className="text-xs text-amber-600">Bal: {Number(b.balance).toLocaleString()}</p>
                    ) : (
                      <p className="text-xs text-emerald-600">Paid</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
