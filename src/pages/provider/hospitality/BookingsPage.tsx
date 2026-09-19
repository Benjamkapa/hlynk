import { useState, useEffect } from "react";
import { CalendarCheck, Plus, Search, Loader2, LogOut, ChevronDown, X } from "lucide-react";
import { eventsApi, resourcesApi, UniversalEvent, Resource } from "../../../lib/api/universal";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Modal } from "../../../components/shared/Modal";
import { useLocation } from "react-router-dom";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  CONFIRMED:   { label: "Confirmed",   color: "bg-emerald-100 text-emerald-800" },
  CHECKED_IN:  { label: "Active",      color: "bg-blue-100 text-blue-800" },
  CHECKED_OUT: { label: "Completed",   color: "bg-slate-100 text-slate-600" },
  CANCELLED:   { label: "Cancelled",   color: "bg-red-100 text-red-700" },
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<UniversalEvent[]>([]);
  const [rooms, setRooms] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState(1);
  const [ratePerUnit, setRatePerUnit] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("MPESA");
  const [bookingSource, setBookingSource] = useState("Direct");

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<UniversalEvent | null>(null);
  const [topupAmount, setTopupAmount] = useState("");
  const [topupMethod, setTopupMethod] = useState("MPESA");

  // Only show available rooms for new bookings
  const availableRooms = rooms.filter(r => r.status === "AVAILABLE" || r.status === "RESERVED");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingData, allResources] = await Promise.all([
        eventsApi.getEvents({ eventType: "BOOKING" }),
        resourcesApi.getResources({}),
      ]);
      setBookings(bookingData);
      setRooms(allResources.filter((r) => r.type !== "PROPERTY"));
    } catch (err: any) {
      toast.error("Failed to load bookings", { description: err.message });
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

  useEffect(() => {
    if (selectedRoomId) {
      const r = rooms.find((room) => room.id === selectedRoomId);
      if (r) {
        setRatePerUnit(r.basePrice.toString());
        setTotalAmount((r.basePrice * duration).toString());
      }
    }
  }, [selectedRoomId]);

  const recalcTotal = (rate: number, n: number) => setTotalAmount((rate * n).toString());

  const handleDurationChange = (n: number) => {
    setDuration(n);
    recalcTotal(parseFloat(ratePerUnit) || 0, n);
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !customerName.trim() || !customerPhone.trim()) {
      return toast.error("Unit, name, and phone are required");
    }
    setSubmitting(true);
    try {
      await eventsApi.createEvent({
        resourceId: selectedRoomId,
        guestName: customerName,
        guestPhone: customerPhone,
        eventType: "BOOKING",
        status: "CONFIRMED",
        startTime: startDate ? `${startDate} 12:00:00` : undefined,
        endTime: endDate ? `${endDate} 12:00:00` : undefined,
        totalAmount: parseFloat(totalAmount) || 0,
        paidAmount: parseFloat(paidAmount) || 0,
        paymentMethod,
        meta: { bookingSource, duration, ratePerUnit: parseFloat(ratePerUnit) || 0 },
      });
      toast.success("Booking created!");
      setShowBookingModal(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedRoomId(""); setCustomerName(""); setCustomerPhone("");
    setStartDate(""); setEndDate(""); setDuration(1);
    setRatePerUnit(""); setTotalAmount(""); setPaidAmount("");
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !topupAmount || parseFloat(topupAmount) <= 0) {
      return toast.error("Enter a valid amount");
    }
    setSubmitting(true);
    try {
      await eventsApi.recordPayment(selectedBooking.id, {
        amount: parseFloat(topupAmount),
        paymentMethod: topupMethod,
        notes: `Balance for ${selectedBooking.guestName || "Customer"}`,
      });
      toast.success("Payment recorded!");
      setShowPaymentModal(false);
      setTopupAmount("");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await eventsApi.updateStatus(bookingId, newStatus);
      toast.success(`Status updated`);
      fetchData();
    } catch (err: any) {
      toast.error("Failed to update status");
    }
  };

  const filtered = bookings.filter((b) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      (b.customerName || b.guestName || "").toLowerCase().includes(q) ||
      (b.customerPhone || "").includes(q) ||
      (b.resourceTitle || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  return (
    <div className="max-w-5xl mx-auto pb-20 px-1">
      {/* Page Header */}
      <div className="flex items-center justify-between py-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Bookings</h1>
        </div>
        <button
          onClick={() => setShowBookingModal(true)}
          className="flex items-center gap-1.5 bg-slate-900 text-white text-sm font-medium px-4 py-2.5 rounded-full hover:bg-slate-700 transition-colors"
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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-slate-400 transition-colors"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {["ALL", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {st === "ALL" ? "All" : STATUS_LABELS[st]?.label || st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="animate-spin text-slate-400" size={24} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <CalendarCheck size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm font-medium">No bookings found</p>
          <button
            onClick={() => setShowBookingModal(true)}
            className="mt-4 text-sm font-medium text-slate-900 underline underline-offset-2"
          >
            Create your first booking
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((b) => {
            const hasBalance = Number(b.balance) > 0;
            const badge = STATUS_LABELS[b.status] || { label: b.status, color: "bg-slate-100 text-slate-600" };
            const isHighlighted = b.id === highlightedId;

            return (
              <motion.div
                key={b.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white border rounded-2xl p-4 transition-shadow hover:shadow-sm ${
                  isHighlighted ? "border-emerald-400 shadow-md" : "border-slate-100"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 text-sm">
                        {b.customerName || b.guestName || "Guest"}
                      </span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {b.customerPhone || "No phone"} · {b.resourceTitle || "Unit"}
                    </p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-800">
                        KES {Number(b.totalAmount).toLocaleString()}
                      </span>
                      {hasBalance ? (
                        <span className="text-xs text-amber-600">
                          Bal: KES {Number(b.balance).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-xs text-emerald-600">Fully paid</span>
                      )}
                      {b.startTime && (
                        <span className="text-xs text-slate-400">
                          {new Date(b.startTime).toLocaleDateString()} – {b.endTime ? new Date(b.endTime).toLocaleDateString() : "?"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    {hasBalance && (
                      <button
                        onClick={() => { setSelectedBooking(b); setShowPaymentModal(true); }}
                        className="text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        Pay balance
                      </button>
                    )}
                    {b.status === "CONFIRMED" && (
                      <button
                        onClick={() => handleStatusChange(b.id, "CHECKED_IN")}
                        className="text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        Check in
                      </button>
                    )}
                    {b.status === "CHECKED_IN" && (
                      <button
                        onClick={() => handleStatusChange(b.id, "CHECKED_OUT")}
                        className="text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <LogOut size={11} /> Check out
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* New Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => { setShowBookingModal(false); resetForm(); }}
        title="New booking"
        maxWidth="md"
      >
        <form onSubmit={handleCreateBooking} className="space-y-4">
          {/* Unit selector */}
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">Unit *</label>
            {availableRooms.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                No available units right now.
              </div>
            ) : (
              <select
                required
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-400"
              >
                <option value="">Select unit...</option>
                {availableRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} — KES {Number(r.basePrice).toLocaleString()}
                  </option>
                ))}
              </select>
            )}
            {selectedRoom && (
              <div className="mt-2 flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                {(selectedRoom.meta?.imageUrl || selectedRoom.meta?.images?.[0]) ? (
                  <img
                    src={selectedRoom.meta.imageUrl || selectedRoom.meta.images[0]}
                    alt={selectedRoom.title}
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold shrink-0">
                    {selectedRoom.title.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{selectedRoom.title}</p>
                  <p className="text-xs text-slate-500">KES {Number(selectedRoom.basePrice).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>

          {/* Guest info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Name *</label>
              <input
                required
                type="text"
                placeholder="John Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Phone *</label>
              <input
                required
                type="text"
                placeholder="0712345678"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Start date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">End date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Duration</label>
              <input type="number" min="1" value={duration}
                onChange={(e) => handleDurationChange(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Source</label>
              <select value={bookingSource} onChange={(e) => setBookingSource(e.target.value)}
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
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
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
              <p className="text-xs text-slate-500 font-medium">Total</p>
              <p className="text-xl font-bold text-slate-900">KES {Number(totalAmount || 0).toLocaleString()}</p>
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-500 block mb-1">Deposit</label>
              <input type="number" placeholder="0" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-slate-400" />
            </div>
          </div>

          <button type="submit" disabled={submitting || availableRooms.length === 0}
            className="w-full bg-slate-900 text-white py-3 rounded-full text-sm font-semibold hover:bg-slate-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="animate-spin" size={16} /> : "Save booking"}
          </button>
        </form>
      </Modal>

      {/* Payment Modal */}
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
                onChange={(e) => setTopupAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Payment</label>
              <select value={topupMethod} onChange={(e) => setTopupMethod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400">
                <option value="MPESA">M-Pesa</option>
                <option value="CASH">Cash</option>
                <option value="BANK">Bank Transfer</option>
                <option value="CARD">Card</option>
              </select>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full bg-slate-900 text-white py-3 rounded-full text-sm font-semibold hover:bg-slate-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="animate-spin" size={16} /> : "Record payment"}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
