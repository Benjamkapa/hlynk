import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Hotel, CalendarCheck, Sparkles, Building, TrendingUp, ArrowUpRight,
  Plus, CheckCircle2, Clock, AlertTriangle, Users, Wallet, RefreshCw, Loader2
} from "lucide-react";
import { resourcesApi, eventsApi, operationsApi, Resource, UniversalEvent, OperationTask } from "../../../lib/api/universal";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function HospitalityOverviewPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [events, setEvents] = useState<UniversalEvent[]>([]);
  const [operations, setOperations] = useState<OperationTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resData, evtData, opData] = await Promise.all([
        resourcesApi.getResources({}),
        eventsApi.getEvents({ eventType: 'BOOKING' }),
        operationsApi.getOperations()
      ]);
      setResources(resData);
      setEvents(evtData);
      setOperations(opData);
    } catch (err: any) {
      toast.error("Failed to load data", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute key KPIs
  const totalUnits = resources.length;
  const occupiedUnits = resources.filter(r => r.status === 'OCCUPIED').length;
  const inProgressUnits = resources.filter(r => r.status === 'CLEANING').length;
  const availableUnits = resources.filter(r => r.status === 'AVAILABLE').length;
  const maintenanceUnits = resources.filter(r => r.status === 'MAINTENANCE').length;

  const utilizationRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  // Calculate today's revenue & pending balance
  const totalRevenue = events.reduce((sum, e) => sum + (Number(e.paidAmount) || 0), 0);
  const pendingBalances = events.reduce((sum, e) => sum + (Number(e.balance) || 0), 0);

  const activeBookings = events.filter(e => e.status === 'CONFIRMED' || e.status === 'CHECKED_IN');
  const pendingOperations = operations.filter(o => o.status === 'PENDING' || o.status === 'IN_PROGRESS');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0D4A3E] to-[#125D4F] p-6 lg:p-8 rounded-[1.5rem] text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 font-medium text-xs uppercase tracking-widest mb-1">
            <CalendarCheck size={16} /> Bookings, Rentals & Services
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight">Overview</h1>
          <p className="text-emerald-100/80 text-xs font-medium mt-1">
            Real-time tracking of units, bookings, service tasks, and revenue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-[.5rem] transition-all text-white text-xs font-bold flex items-center gap-2 backdrop-blur-sm"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <Link
            to="/dashboard/hospitality/bookings"
            className="px-5 py-3 bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-[.5rem] hover:bg-emerald-300 transition-all flex items-center gap-2 shadow-lg active:scale-95"
          >
            <Plus size={16} /> New Booking
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Occupancy Rate */}
        <div className="bg-white p-5 rounded-[1.2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Utilization Rate</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl lg:text-3xl font-black text-slate-900 leading-none">{utilizationRate}%</div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {occupiedUnits} of {totalUnits} units active
            </p>
          </div>
        </div>

        {/* Revenue Collected */}
        <div className="bg-white p-5 rounded-[1.2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Revenue Paid</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <Wallet size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl lg:text-3xl font-black text-slate-900 leading-none">
              KES {totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Directly synced with Core Revenue
            </p>
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="bg-white p-5 rounded-[1.2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pending Balances</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl lg:text-3xl font-black text-amber-600 leading-none">
              KES {pendingBalances.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Uncollected customer payments
            </p>
          </div>
        </div>

        {/* Operational Tasks */}
        <div className="bg-white p-5 rounded-[1.2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tasks & Maintenance</span>
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl lg:text-3xl font-black text-purple-700 leading-none">
              {pendingOperations.length}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {inProgressUnits} units needing attention
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/dashboard/hospitality/properties"
          className="group bg-white p-6 rounded-[1.2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="h-12 w-12 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Building size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              Units & Resources
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              Manage your units, slots, pricing, features, and availability statuses.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 mt-6 group-hover:translate-x-1 transition-transform">
            View All Units <ArrowUpRight size={14} />
          </div>
        </Link>

        <Link
          to="/dashboard/hospitality/bookings"
          className="group bg-white p-6 rounded-[1.2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="h-12 w-12 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CalendarCheck size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
              Bookings & Reservations
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              Record reservations, start/end dates, channels (WhatsApp, Direct, Platform), and deposits.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 mt-6 group-hover:translate-x-1 transition-transform">
            Manage Bookings <ArrowUpRight size={14} />
          </div>
        </Link>

        <Link
          to="/dashboard/hospitality/operations"
          className="group bg-white p-6 rounded-[1.2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-500/30 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="h-12 w-12 bg-purple-50 text-purple-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
              Tasks & Maintenance
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              Track pending tasks and maintenance issues. Completed repairs auto-sync to Core Expenses.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 mt-6 group-hover:translate-x-1 transition-transform">
            View Task Queue <ArrowUpRight size={14} />
          </div>
        </Link>
      </div>

      {/* Room Status Overview & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Room Status Grid */}
        <div className="bg-white p-6 rounded-[1.2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Unit Status Overview</h3>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              {totalUnits} Total Units
            </span>
          </div>

          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <Loader2 className="animate-spin text-emerald-600" size={24} />
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
              <Building size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium text-slate-500">No units added yet.</p>
              <Link
                to="/dashboard/hospitality/properties"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline"
              >
                <Plus size={14} /> Add your first unit
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {resources.map((room) => {
                const isOccupied = room.status === 'OCCUPIED';
                const isCleaning = room.status === 'CLEANING';
                const isMaintenance = room.status === 'MAINTENANCE';

                const badgeBg = isOccupied
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : isCleaning
                  ? 'bg-purple-50 border-purple-200 text-purple-700'
                  : isMaintenance
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700';

                return (
                  <div key={room.id} className={`p-3.5 rounded-xl border ${badgeBg} flex flex-col justify-between`}>
                    <div className="flex items-center gap-3">
                      {room.meta?.imageUrl || (Array.isArray(room.meta?.images) && room.meta.images[0]) ? (
                        <img
                          src={room.meta?.imageUrl || room.meta?.images?.[0]}
                          alt={room.title}
                          className="w-10 h-10 rounded-lg object-cover border border-black/10 shrink-0 shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/70 font-black text-xs flex items-center justify-center border border-black/5 shrink-0">
                          {room.title.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-black uppercase tracking-tight block truncate">
                          {room.title}
                        </span>
                        <span className="text-[10px] font-semibold opacity-75 uppercase tracking-wider block truncate">
                          {room.code ? `#${room.code}` : room.type}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/80">
                        {room.status}
                      </span>
                      <span className="text-xs font-bold">
                        KES {Number(room.basePrice).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Bookings List */}
        <div className="bg-white p-6 rounded-[1.2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Current & Upcoming</h3>
            <Link to="/dashboard/hospitality/bookings" className="text-xs font-bold text-emerald-700 hover:underline">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <Loader2 className="animate-spin text-emerald-600" size={24} />
            </div>
          ) : activeBookings.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
              <Users size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium text-slate-500">No active bookings right now.</p>
              <Link
                to="/dashboard/hospitality/bookings"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline"
              >
                <Plus size={14} /> Create a booking
              </Link>
            </div>
          ) : (
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {activeBookings.map((b) => (
                <div key={b.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{b.customerName || b.guestName || 'Customer'}</span>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        {b.resourceTitle}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Phone: {b.customerPhone || 'N/A'} • Source: {b.meta?.bookingSource || 'Direct'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-slate-900">
                      KES {Number(b.totalAmount).toLocaleString()}
                    </div>
                    <span className={`text-[10px] font-semibold ${b.balance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {b.balance > 0 ? `Bal: KES ${Number(b.balance).toLocaleString()}` : 'Fully Paid'}
                    </span>
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
