import { useState, useEffect } from "react";
import { CalendarCheck, Plus, Search, LogOut, WifiOff, Pencil, Calendar, User, Phone } from "lucide-react";
import InlineLoader, { ButtonLoader } from "../../../components/shared/InlineLoader";
import { eventsApi, resourcesApi, UniversalEvent, Resource } from "../../../lib/api/universal";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Modal } from "../../../components/shared/Modal";
import { useLocation } from "react-router-dom";
import { enqueueEvent } from "../../../lib/offline/db";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  CONFIRMED:   { label: "Confirmed",  color: "bg-emerald-100 text-emerald-800" },
  CHECKED_IN:  { label: "Active",     color: "bg-blue-100 text-blue-800" },
  CHECKED_OUT: { label: "Completed",  color: "bg-slate-100 text-slate-600" },
  CANCELLED:   { label: "Cancelled",  color: "bg-red-100 text-red-700" },
};

// ── Helpers ────────────────────────────────────────────────────────────────────
/** Calculate whole-day difference between two date strings (yyyy-mm-dd) */
function calcDays(start: string, end: string): number {
  if (!start || !end) return 1;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const days = Math.round(ms / 86_400_000);
  return days > 0 ? days : 1;
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function BookingsPage() {
  const [bookings, setBookings]           = useState<UniversalEvent[]>([]);
  const [rooms, setRooms]                 = useState<Resource[]>([]);
  const [loading, setLoading]             = useState(true);
  const [isOffline, setIsOffline]         = useState(!navigator.onLine);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const location = useLocation();

  const [searchTerm, setSearchTerm]   = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // ── New Booking modal state ──────────────────────────────────────────────────
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [submitting, setSubmitting]             = useState(false);

  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [customerName, setCustomerName]     = useState("");
  const [customerPhone, setCustomerPhone]   = useState("");
  const [startDate, setStartDate]           = useState("");
  const [endDate, setEndDate]               = useState("");
  const [duration, setDuration]             = useState(1);
  const [ratePerUnit, setRatePerUnit]       = useState("");
  const [totalAmount, setTotalAmount]       = useState("");
  const [paidAmount, setPaidAmount]         = useState("");
  const [paymentMethod, setPaymentMethod]   = useState("MPESA");
  const [bookingSource, setBookingSource]   = useState("Direct");

  // ── Pay Balance modal state ──────────────────────────────────────────────────
  const [showPaymentModal, setShowPaymentModal]   = useState(false);
  const [selectedBooking, setSelectedBooking]     = useState<UniversalEvent | null>(null);
  const [topupAmount, setTopupAmount]             = useState("");
  const [topupMethod, setTopupMethod]             = useState("MPESA");

  // ── Extend / Shorten modal state ─────────────────────────────────────────────
  const [showEditModal, setShowEditModal]         = useState(false);
  const [editBooking, setEditBooking]             = useState<UniversalEvent | null>(null);
  const [editStartDate, setEditStartDate]         = useState("");
  const [editEndDate, setEditEndDate]             = useState("");
  const [editDuration, setEditDuration]           = useState(1);
  const [editRate, setEditRate]                   = useState("");
  const [editTotal, setEditTotal]                 = useState("");
  const [editPaid, setEditPaid]                   = useState("");
  const [additionalPayment, setAdditionalPayment] = useState("");
  const [editPayMethod, setEditPayMethod]         = useState("MPESA");
  const [editNotes, setEditNotes]                 = useState("");

  // Only show available rooms for new bookings
  const availableRooms = rooms.filter(r => r.status === "AVAILABLE" || r.status === "RESERVED");

  // ── Data fetch ──────────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    const offlineNow = typeof navigator !== "undefined" && !navigator.onLine;
    setIsOffline(offlineNow);

    if (offlineNow) {
      const cEvt  = localStorage.getItem("hlynk_cached_events");
      const cUnits = localStorage.getItem("hlynk_cached_units");
      if (cEvt)  setBookings(JSON.parse(cEvt));
      if (cUnits) setRooms(JSON.parse(cUnits));
      setLoading(false);
      return;
    }

    try {
      const [bookingData, allResources] = await Promise.all([
        eventsApi.getEvents({ eventType: "BOOKING" }),
        resourcesApi.getResources({}),
      ]);
      const fetchedRooms = allResources.filter(r => r.type !== "PROPERTY");
      setBookings(bookingData);
      setRooms(fetchedRooms);
      localStorage.setItem("hlynk_cached_events", JSON.stringify(bookingData));
      localStorage.setItem("hlynk_cached_units",  JSON.stringify(fetchedRooms));
    } catch {
      const cEvt  = localStorage.getItem("hlynk_cached_events");
      const cUnits = localStorage.getItem("hlynk_cached_units");
      if (cEvt)  setBookings(JSON.parse(cEvt));
      if (cUnits) setRooms(JSON.parse(cUnits));
      if (navigator.onLine) toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const highlightId = (location.state as any)?.highlightId;
    if (highlightId) {
      setHighlightedId(highlightId);
      const t = setTimeout(() => setHighlightedId(null), 5000);
      return () => clearTimeout(t);
    }
  }, [location.state]);

  // ── Auto-save and restore booking draft ──────────────────────────────────────
  const DRAFT_KEY = "hlynk_booking_draft";

  // Restore draft on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.selectedRoomId) setSelectedRoomId(d.selectedRoomId);
        if (d.customerName)   setCustomerName(d.customerName);
        if (d.customerPhone)  setCustomerPhone(d.customerPhone);
        if (d.startDate)      setStartDate(d.startDate);
        if (d.endDate)        setEndDate(d.endDate);
        if (d.duration)       setDuration(d.duration);
        if (d.ratePerUnit)    setRatePerUnit(d.ratePerUnit);
        if (d.totalAmount)    setTotalAmount(d.totalAmount);
        if (d.paidAmount)     setPaidAmount(d.paidAmount);
        if (d.paymentMethod)  setPaymentMethod(d.paymentMethod);
        if (d.bookingSource)  setBookingSource(d.bookingSource);
      }
    } catch (_) {}
  }, []);

  // Save draft whenever user types
  useEffect(() => {
    if (!customerName && !selectedRoomId && !customerPhone && !startDate) {
      return;
    }
    const draft = {
      selectedRoomId, customerName, customerPhone, startDate, endDate,
      duration, ratePerUnit, totalAmount, paidAmount, paymentMethod, bookingSource
    };
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (_) {}
  }, [selectedRoomId, customerName, customerPhone, startDate, endDate, duration, ratePerUnit, totalAmount, paidAmount, paymentMethod, bookingSource]);

  // Unsaved changes beforeunload warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (showBookingModal && (customerName.trim() || selectedRoomId || customerPhone.trim())) {
        e.preventDefault();
        e.returnValue = "You have an unfinished booking. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [showBookingModal, customerName, selectedRoomId, customerPhone]);

  // ── Auto-fill rate when unit is selected ────────────────────────────────────
  useEffect(() => {
    if (selectedRoomId) {
      const r = rooms.find(room => room.id === selectedRoomId);
      if (r) {
        const rate = r.basePrice.toString();
        setRatePerUnit(rate);
        setTotalAmount((r.basePrice * duration).toString());
      }
    }
  }, [selectedRoomId]);

  // ── Auto-calculate days & total when dates change (NEW BOOKING) ─────────────
  useEffect(() => {
    if (startDate && endDate) {
      const days = calcDays(startDate, endDate);
      const rate = parseFloat(ratePerUnit) || 0;
      setDuration(days);
      if (rate > 0) setTotalAmount((rate * days).toString());
    }
  }, [startDate, endDate]);

  // Also recalc when duration is typed manually
  const handleDurationChange = (n: number) => {
    const days = n < 1 ? 1 : n;
    setDuration(days);
    const rate = parseFloat(ratePerUnit) || 0;
    if (rate > 0) setTotalAmount((rate * days).toString());
    // Push endDate forward from startDate
    if (startDate) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + days);
      setEndDate(d.toISOString().slice(0, 10));
    }
  };

  // ── Auto-calculate for EDIT modal ───────────────────────────────────────────
  useEffect(() => {
    if (editStartDate && editEndDate) {
      const days = calcDays(editStartDate, editEndDate);
      const rate = parseFloat(editRate) || 0;
      setEditDuration(days);
      if (rate > 0) setEditTotal((rate * days).toString());
    }
  }, [editStartDate, editEndDate]);

  const handleEditDurationChange = (n: number) => {
    const days = n < 1 ? 1 : n;
    setEditDuration(days);
    const rate = parseFloat(editRate) || 0;
    if (rate > 0) setEditTotal((rate * days).toString());
    if (editStartDate) {
      const d = new Date(editStartDate);
      d.setDate(d.getDate() + days);
      setEditEndDate(d.toISOString().slice(0, 10));
    }
  };

  // ── Create Booking ──────────────────────────────────────────────────────────
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !customerName.trim()) {
      return toast.error("Select a unit and enter guest name");
    }
    setSubmitting(true);
    const room = rooms.find(r => r.id === selectedRoomId);
    const payload = {
      resourceId:    selectedRoomId,
      guestName:     customerName,
      guestPhone:    customerPhone,
      customerName,
      customerPhone,
      eventType:     "BOOKING",
      status:        "CONFIRMED",
      startTime:     startDate ? `${startDate} 12:00:00` : new Date().toISOString(),
      endTime:       endDate   ? `${endDate} 12:00:00`   : new Date().toISOString(),
      totalAmount:   parseFloat(totalAmount) || 0,
      paidAmount:    parseFloat(paidAmount)  || 0,
      paymentMethod,
      meta: { bookingSource, duration, ratePerUnit: parseFloat(ratePerUnit) || 0 },
    };

    if (!navigator.onLine) {
      const offlineId = "offline-booking-" + Date.now();
      const newBooking: UniversalEvent = {
        id: offlineId, tenantId: "local",
        resourceTitle: room?.title || "Unit",
        balance: (parseFloat(totalAmount) || 0) - (parseFloat(paidAmount) || 0),
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        ...payload,
      };
      const updated = [newBooking, ...bookings];
      setBookings(updated);
      localStorage.setItem("hlynk_cached_events", JSON.stringify(updated));
      if (room) {
        const ur = rooms.map(r => r.id === selectedRoomId ? { ...r, status: "OCCUPIED" } : r);
        setRooms(ur);
        localStorage.setItem("hlynk_cached_units", JSON.stringify(ur));
      }
      await enqueueEvent({ id: offlineId, action: "CREATE", payload, createdAt: Date.now() });
      toast.success("Booking recorded offline!", { description: "Will sync when back online." });
      setShowBookingModal(false);
      resetForm();
      setSubmitting(false);
      return;
    }

    try {
      await eventsApi.createEvent(payload);
      toast.success("Booking created!");
      setShowBookingModal(false);
      resetForm();
      fetchData();
    } catch {
      const offlineId = "offline-booking-" + Date.now();
      const newBooking: UniversalEvent = {
        id: offlineId, tenantId: "local",
        resourceTitle: room?.title || "Unit",
        balance: (parseFloat(totalAmount) || 0) - (parseFloat(paidAmount) || 0),
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        ...payload,
      };
      const updated = [newBooking, ...bookings];
      setBookings(updated);
      localStorage.setItem("hlynk_cached_events", JSON.stringify(updated));
      await enqueueEvent({ id: offlineId, action: "CREATE", payload, createdAt: Date.now() });
      toast.success("Booking saved offline (network issue)");
      setShowBookingModal(false);
      resetForm();
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedRoomId(""); setCustomerName(""); setCustomerPhone("");
    setStartDate(""); setEndDate(""); setDuration(1);
    setRatePerUnit(""); setTotalAmount(""); setPaidAmount("");
    try { sessionStorage.removeItem(DRAFT_KEY); } catch (_) {}
  };

  // ── Record payment ──────────────────────────────────────────────────────────
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !topupAmount || parseFloat(topupAmount) <= 0) {
      return toast.error("Enter a valid amount");
    }
    setSubmitting(true);
    const amount = parseFloat(topupAmount);
    const payload = { amount, paymentMethod: topupMethod, notes: `Balance for ${selectedBooking.guestName || "Customer"}` };

    if (!navigator.onLine) {
      const updated = bookings.map(b => {
        if (b.id !== selectedBooking.id) return b;
        const newPaid = b.paidAmount + amount;
        return { ...b, paidAmount: newPaid, balance: Math.max(0, b.totalAmount - newPaid) };
      });
      setBookings(updated);
      localStorage.setItem("hlynk_cached_events", JSON.stringify(updated));
      await enqueueEvent({ id: "pay-" + Date.now(), action: "RECORD_PAYMENT", targetId: selectedBooking.id, payload, createdAt: Date.now() });
      toast.success("Payment recorded offline!");
      setShowPaymentModal(false); setTopupAmount(""); setSubmitting(false);
      return;
    }

    try {
      await eventsApi.recordPayment(selectedBooking.id, payload);
      toast.success("Payment recorded!");
      setShowPaymentModal(false); setTopupAmount("");
      fetchData();
    } catch {
      const updated = bookings.map(b => {
        if (b.id !== selectedBooking.id) return b;
        const newPaid = b.paidAmount + amount;
        return { ...b, paidAmount: newPaid, balance: Math.max(0, b.totalAmount - newPaid) };
      });
      setBookings(updated);
      localStorage.setItem("hlynk_cached_events", JSON.stringify(updated));
      await enqueueEvent({ id: "pay-" + Date.now(), action: "RECORD_PAYMENT", targetId: selectedBooking.id, payload, createdAt: Date.now() });
      toast.success("Payment recorded offline");
      setShowPaymentModal(false); setTopupAmount("");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Open Edit modal ─────────────────────────────────────────────────────────
  const openEditModal = (b: UniversalEvent) => {
    setEditBooking(b);
    const s = b.startTime ? new Date(b.startTime).toISOString().slice(0, 10) : "";
    const e = b.endTime   ? new Date(b.endTime).toISOString().slice(0, 10)   : "";
    setEditStartDate(s);
    setEditEndDate(e);
    const days = (s && e) ? calcDays(s, e) : (b.meta?.duration || 1);
    setEditDuration(days);
    const rate = b.meta?.ratePerUnit || (days > 0 ? b.totalAmount / days : b.totalAmount);
    setEditRate(rate.toString());
    setEditTotal(b.totalAmount.toString());
    setEditPaid(b.paidAmount.toString());
    setAdditionalPayment("");
    setEditPayMethod("MPESA");
    setEditNotes("");
    setShowEditModal(true);
  };

  // ── Submit edit (extend / shorten) ──────────────────────────────────────────
  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBooking) return;
    setSubmitting(true);

    const extraPaid   = parseFloat(additionalPayment) || 0;
    const currentPaid = Number(editBooking.paidAmount) || 0;
    const newTotal    = parseFloat(editTotal) || 0;
    const newPaid     = currentPaid + extraPaid;
    const newBalance  = Math.max(0, newTotal - newPaid);
    const payload = {
      startTime:   editStartDate ? `${editStartDate} 12:00:00` : undefined,
      endTime:     editEndDate   ? `${editEndDate} 12:00:00`   : undefined,
      totalAmount: newTotal,
      paidAmount:  newPaid,
      paymentMethod: editPayMethod,
      notes:       editNotes || `Booking updated`,
      meta:        { duration: editDuration, ratePerUnit: parseFloat(editRate) || 0 },
    };

    try {
      if (navigator.onLine) {
        await eventsApi.updateEvent(editBooking.id, payload);
        toast.success("Booking updated!");
        fetchData();
      } else {
        const updated = bookings.map(b => b.id === editBooking.id
          ? { ...b, startTime: payload.startTime || b.startTime, endTime: payload.endTime || b.endTime, totalAmount: newTotal, paidAmount: newPaid, balance: newBalance, meta: { ...(b.meta || {}), duration: editDuration, ratePerUnit: parseFloat(editRate) || 0 } }
          : b);
        setBookings(updated);
        localStorage.setItem("hlynk_cached_events", JSON.stringify(updated));
        await enqueueEvent({ id: "upd-" + Date.now(), action: "UPDATE", targetId: editBooking.id, payload, createdAt: Date.now() });
        toast.success("Booking updated (saved offline)");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update booking");
    } finally {
      setSubmitting(false);
      setShowEditModal(false);
    }
  };

  // ── Status change ───────────────────────────────────────────────────────────
  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    const updated = bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b);
    setBookings(updated);
    localStorage.setItem("hlynk_cached_events", JSON.stringify(updated));

    if (!navigator.onLine) {
      await enqueueEvent({ id: "st-" + Date.now(), action: "UPDATE", targetId: bookingId, payload: { status: newStatus }, createdAt: Date.now() });
      toast.success("Status updated (offline)");
      return;
    }
    try {
      await eventsApi.updateStatus(bookingId, newStatus);
      toast.success("Status updated");
      fetchData();
    } catch {
      await enqueueEvent({ id: "st-" + Date.now(), action: "UPDATE", targetId: bookingId, payload: { status: newStatus }, createdAt: Date.now() });
      toast.success("Status updated (saved offline)");
    }
  };

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = bookings.filter(b => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      (b.customerName || b.guestName || "").toLowerCase().includes(q) ||
      (b.customerPhone || "").includes(q) ||
      (b.resourceTitle || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  // ── Duration label (could be days or hours for car hire) ────────────────────
  const durationLabel = "Days";

  return (
    <div className="space-y-8 pt-4">
      {/* Offline Banner */}
      {isOffline && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-medium text-amber-800">
          <WifiOff size={15} className="text-amber-600 shrink-0" />
          <span>Offline Mode: Viewing cached booking records.</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between py-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Bookings</h1>
        </div>
        <button
          onClick={() => setShowBookingModal(true)}
          className="flex items-center gap-1.5 bg-[#0D4A3E] text-white text-sm font-medium px-4 py-2.5 rounded-full hover:bg-[#0A3D33] transition-colors"
        >
          <Plus size={15} /> New booking
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search guest, phone or unit..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-slate-400"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {["ALL", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED"].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${statusFilter === st ? "bg-[#0D4A3E] text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"}`}
            >
              {st === "ALL" ? "All" : STATUS_LABELS[st]?.label || st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <InlineLoader size="md" color="text-slate-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <CalendarCheck size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm font-medium">No bookings found</p>
          <button
            onClick={() => setShowBookingModal(true)}
            className="mt-4 text-sm font-normal bg-[#0D4A3E] px-3 py-2 text-white rounded-full"
          >
            Create your first booking
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map(b => {
              const hasBalance  = Number(b.balance) > 0;
              const badge       = STATUS_LABELS[b.status] || { label: b.status, color: "bg-slate-100 text-slate-600" };
              const isHighlighted = b.id === highlightedId;
              const days        = (b.startTime && b.endTime) ? calcDays(new Date(b.startTime).toISOString().slice(0,10), new Date(b.endTime).toISOString().slice(0,10)) : (b.meta?.duration || "—");

              return (
                <motion.div
                  key={b.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className={`bg-white border rounded-2xl p-4 flex flex-col justify-between transition-all hover:shadow-md ${
                    isHighlighted
                      ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                      : "border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Customer Name & Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <User size={14} className="text-slate-400 shrink-0" />
                          <h3 className="font-bold text-slate-900 text-sm truncate">
                            {b.customerName || b.guestName || "Guest"}
                          </h3>
                        </div>
                        {b.customerPhone ? (
                          <a
                            href={`tel:${b.customerPhone}`}
                            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mt-0.5 truncate transition-colors"
                          >
                            <Phone size={11} className="text-slate-400 shrink-0" />
                            <span>{b.customerPhone}</span>
                          </a>
                        ) : (
                          <p className="text-xs text-slate-400 mt-0.5">No phone</p>
                        )}
                      </div>

                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Unit / Asset Badge */}
                    <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <div className="min-w-0 flex items-center gap-1.5">
                        <span className="text-[11px] font-medium text-slate-400">Unit:</span>
                        <span className="font-semibold text-slate-800 truncate">{b.resourceTitle || "Unit"}</span>
                      </div>
                      {b.meta?.bookingSource && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200/80 shrink-0">
                          {b.meta.bookingSource}
                        </span>
                      )}
                    </div>

                    {/* Dates & Duration */}
                    <div className="flex items-center justify-between text-xs px-1">
                      <div className="flex items-center gap-1.5 text-slate-600 font-medium truncate">
                        <Calendar size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{fmtDate(b.startTime)} → {fmtDate(b.endTime)}</span>
                      </div>
                      <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px] shrink-0">
                        {days} {durationLabel}
                      </span>
                    </div>

                    {/* Financial Summary */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total</p>
                        <p className="text-sm font-bold text-slate-900 leading-tight">
                          KES {Number(b.totalAmount).toLocaleString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Payment</p>
                        {hasBalance ? (
                          <span className="inline-block text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-full">
                            Bal: KES {Number(b.balance).toLocaleString()}
                          </span>
                        ) : (
                          <span className="inline-block text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                            Fully Paid
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(b)}
                      className="flex-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 py-2 rounded-xl transition-all flex items-center justify-center gap-1 active:scale-95"
                      title="Extend or shorten stay, update rate, or record payment"
                    >
                      <Pencil size={12} /> Edit
                    </button>

                    {hasBalance && (
                      <button
                        onClick={() => { setSelectedBooking(b); setShowPaymentModal(true); }}
                        className="flex-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/70 py-2 rounded-xl transition-all flex items-center justify-center gap-1 active:scale-95"
                      >
                        Pay balance
                      </button>
                    )}

                    {b.status === "CONFIRMED" && (
                      <button
                        onClick={() => handleStatusChange(b.id, "CHECKED_IN")}
                        className="flex-1 text-xs font-semibold text-white bg-[#0D4A3E] hover:bg-[#0A3D33] py-2 rounded-xl transition-all flex items-center justify-center gap-1 active:scale-95 shadow-xs"
                      >
                        Check in
                      </button>
                    )}

                    {b.status === "CHECKED_IN" && (
                      <button
                        onClick={() => handleStatusChange(b.id, "CHECKED_OUT")}
                        className="flex-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 py-2 rounded-xl transition-all flex items-center justify-center gap-1 active:scale-95"
                      >
                        <LogOut size={12} /> Check out
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── New Booking Modal ── */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="New booking"
        maxWidth="md"
      >
        <form onSubmit={handleCreateBooking} className="space-y-4">
          {/* Unit selector */}
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">Unit *</label>
            {availableRooms.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                No available units. Mark a unit as Available in Properties first.
              </div>
            ) : (
              <select value={selectedRoomId} onChange={e => setSelectedRoomId(e.target.value)} required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400">
                <option value="">Select unit...</option>
                {availableRooms.map(r => (
                  <option key={r.id} value={r.id}>{r.title} — KES {Number(r.basePrice).toLocaleString()}</option>
                ))}
              </select>
            )}
            {selectedRoom && (
              <div className="mt-2 flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                {(selectedRoom.meta?.imageUrl || selectedRoom.meta?.images?.[0]) ? (
                  <img src={selectedRoom.meta.imageUrl || selectedRoom.meta.images?.[0]} alt={selectedRoom.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold shrink-0">
                    {selectedRoom.title.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{selectedRoom.title}</p>
                  <p className="text-xs text-slate-500">KES {Number(selectedRoom.basePrice).toLocaleString()} / night</p>
                </div>
              </div>
            )}
          </div>

          {/* Guest info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Name *</label>
              <input required type="text" placeholder="John Doe" value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Phone</label>
              <input type="text" placeholder="0712345678" value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
            </div>
          </div>

          {/* Dates — auto-calculate days */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Start date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">End date</label>
              <input type="date" value={endDate} min={startDate || undefined} onChange={e => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">{durationLabel}</label>
              <input type="number" min="1" value={duration}
                onChange={e => handleDurationChange(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Source</label>
              <select value={bookingSource} onChange={e => setBookingSource(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400">
                <option value="Direct">Direct</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Online">Online</option>
                <option value="Agent">Agent</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Payment</label>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400">
                <option value="MPESA">M-Pesa</option>
                <option value="CASH">Cash</option>
                <option value="BANK">Bank Transfer</option>
                <option value="CARD">Card</option>
              </select>
            </div>
          </div>

          {/* Total + Deposit */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total ({duration} {durationLabel.toLowerCase()})</p>
              <p className="text-xl font-bold text-slate-900">KES {Number(totalAmount || 0).toLocaleString()}</p>
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-500 block mb-1">Deposit paid</label>
              <input type="number" placeholder="0" value={paidAmount} onChange={e => setPaidAmount(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-slate-400" />
            </div>
          </div>

          <button type="submit" disabled={submitting || availableRooms.length === 0}
            className="w-full bg-[#0D4A3E] text-white py-3 rounded-full text-sm font-semibold hover:bg-[#0A3D33] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            {submitting ? <ButtonLoader size={16} /> : "Save booking"}
          </button>
        </form>
      </Modal>

      {/* ── Pay Balance Modal ── */}
      <Modal
        isOpen={showPaymentModal && !!selectedBooking}
        onClose={() => setShowPaymentModal(false)}
        title="Record payment"
        maxWidth="sm"
      >
        {selectedBooking && (
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800">
              <span className="font-semibold">{selectedBooking.guestName || "Customer"}</span>
              {" "}· Outstanding: <span className="font-bold">KES {Number(selectedBooking.balance).toLocaleString()}</span>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Amount (KES)</label>
              <input required type="number" max={selectedBooking.balance}
                placeholder={`Max ${selectedBooking.balance}`} value={topupAmount}
                onChange={e => setTopupAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Payment method</label>
              <select value={topupMethod} onChange={e => setTopupMethod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400">
                <option value="MPESA">M-Pesa</option>
                <option value="CASH">Cash</option>
                <option value="BANK">Bank Transfer</option>
                <option value="CARD">Card</option>
              </select>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full bg-[#0D4A3E] text-white py-3 rounded-full text-sm font-semibold hover:bg-slate-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
              {submitting ? <ButtonLoader size={16} /> : "Record payment"}
            </button>
          </form>
        )}
      </Modal>

      {/* ── Edit / Extend / Shorten Booking Modal ── */}
      <Modal
        isOpen={showEditModal && !!editBooking}
        onClose={() => setShowEditModal(false)}
        title="Edit booking"
        maxWidth="md"
      >
        {editBooking && (
          <form onSubmit={handleUpdateBooking} className="space-y-4">
            {/* Context banner */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700">
              <span className="font-semibold">{editBooking.guestName || editBooking.customerName || "Guest"}</span>
              {" — "}<span className="text-slate-500">{editBooking.resourceTitle || "Unit"}</span>
            </div>

            <p className="text-xs text-slate-500">
              Change dates to <span className="font-semibold text-slate-700">extend</span> (guest staying longer) or <span className="font-semibold text-slate-700">shorten</span> (early checkout). Duration and total will recalculate automatically.
            </p>

            {/* Dates */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">Start date</label>
                <input type="date" value={editStartDate} onChange={e => setEditStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">End date</label>
                <input type="date" value={editEndDate} min={editStartDate || undefined} onChange={e => setEditEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">{durationLabel}</label>
                <input type="number" min="1" value={editDuration}
                  onChange={e => handleEditDurationChange(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
              </div>
            </div>

            {/* Rate + Totals */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">Rate per night (KES)</label>
                <input type="number" value={editRate}
                  onChange={e => {
                    setEditRate(e.target.value);
                    const rate = parseFloat(e.target.value) || 0;
                    setEditTotal((rate * editDuration).toString());
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">New total (KES)</label>
                <input type="number" value={editTotal} onChange={e => setEditTotal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
              </div>
            </div>

            {/* Recap + Additional Payment */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Duration</span>
                <span className="font-semibold">{editDuration} {durationLabel.toLowerCase()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">New total</span>
                <span className="font-bold text-slate-900">KES {Number(editTotal || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Already paid</span>
                <span className="font-medium text-emerald-700">KES {Number(editBooking.paidAmount).toLocaleString()}</span>
              </div>
              {parseFloat(additionalPayment) > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">+ Paying now</span>
                  <span className="font-semibold text-emerald-700">KES {Number(additionalPayment).toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm font-semibold border-t border-slate-200 pt-2">
                <span className="text-slate-600">New balance</span>
                <span className={Math.max(0, Number(editTotal || 0) - (Number(editBooking.paidAmount) + (parseFloat(additionalPayment) || 0))) > 0 ? "text-amber-600" : "text-emerald-600"}>
                  KES {Math.max(0, Number(editTotal || 0) - (Number(editBooking.paidAmount) + (parseFloat(additionalPayment) || 0))).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Additional payment on this update */}
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">
                Additional payment now (optional)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={additionalPayment}
                  onChange={e => setAdditionalPayment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                />
                <select value={editPayMethod} onChange={e => setEditPayMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400">
                  <option value="MPESA">M-Pesa</option>
                  <option value="CASH">Cash</option>
                  <option value="BANK">Bank Transfer</option>
                  <option value="CARD">Card</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Notes (optional)</label>
              <input type="text" placeholder="e.g. Extended stay by 2 nights" value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
            </div>

            <button type="submit" disabled={submitting}
              className="w-full bg-[#0D4A3E] text-white py-3 rounded-full text-sm font-semibold hover:bg-[#0A3D33] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {submitting ? <ButtonLoader size={16} /> : "Update booking"}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
