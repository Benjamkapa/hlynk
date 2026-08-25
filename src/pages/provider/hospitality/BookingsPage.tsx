import { useState, useEffect } from "react";
import {
  CalendarCheck, Plus, Search, Filter, Loader2, CheckCircle2, Clock,
  AlertCircle, DollarSign, User, Phone, X, CreditCard, LogOut
} from "lucide-react";
import { eventsApi, resourcesApi, UniversalEvent, Resource } from "../../../lib/api/universal";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<UniversalEvent[]>([]);
  const [rooms, setRooms] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Booking Modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
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

  // Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<UniversalEvent | null>(null);
  const [topupAmount, setTopupAmount] = useState("");
  const [topupMethod, setTopupMethod] = useState("MPESA");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingData, unitData] = await Promise.all([
        eventsApi.getEvents({ eventType: 'BOOKING' }),
        resourcesApi.getResources({})
      ]);
      setBookings(bookingData);
      setRooms(unitData);
    } catch (err: any) {
      toast.error("Failed to load bookings", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // When room is selected, auto fill rate
  useEffect(() => {
    if (selectedRoomId) {
      const r = rooms.find(room => room.id === selectedRoomId);
      if (r) {
        setRatePerUnit(r.basePrice.toString());
        recalculateTotal(r.basePrice, duration);
      }
    }
  }, [selectedRoomId]);

  const recalculateTotal = (rate: number, numUnits: number) => {
    const tot = rate * numUnits;
    setTotalAmount(tot.toString());
  };

  const handleDurationChange = (n: number) => {
    setDuration(n);
    const rate = parseFloat(ratePerUnit) || 0;
    recalculateTotal(rate, n);
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !customerName.trim() || !customerPhone.trim()) {
      return toast.error("Unit, Customer Name, and Phone are required");
    }

    setSubmitting(true);
    try {
      await eventsApi.createEvent({
        resourceId: selectedRoomId,
        guestName: customerName,
        guestPhone: customerPhone,
        eventType: 'BOOKING',
        status: 'CONFIRMED',
        startTime: startDate ? `${startDate} 12:00:00` : undefined,
        endTime: endDate ? `${endDate} 12:00:00` : undefined,
        totalAmount: parseFloat(totalAmount) || 0,
        paidAmount: parseFloat(paidAmount) || 0,
        paymentMethod,
        meta: {
          bookingSource,
          duration,
          ratePerUnit: parseFloat(ratePerUnit) || 0
        }
      });

      toast.success("Booking created successfully!");
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
    setSelectedRoomId("");
    setCustomerName("");
    setCustomerPhone("");
    setStartDate("");
    setEndDate("");
    setDuration(1);
    setRatePerUnit("");
    setTotalAmount("");
    setPaidAmount("");
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !topupAmount || parseFloat(topupAmount) <= 0) {
      return toast.error("Please enter a valid payment amount");
    }

    setSubmitting(true);
    try {
      await eventsApi.recordPayment(selectedBooking.id, {
        amount: parseFloat(topupAmount),
        paymentMethod: topupMethod,
        notes: `Balance payment for ${selectedBooking.guestName || 'Customer'}`
      });

      toast.success("Payment recorded & synced to Core Revenue!");
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
      toast.success(`Booking status updated to ${newStatus}`);
      fetchData();
    } catch (err: any) {
      toast.error("Failed to update status", { description: err.message });
    }
  };

  // Filtered List
  const filteredBookings = bookings.filter(b => {
    const matchesSearch =
      (b.customerName || b.guestName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.customerPhone || '').includes(searchTerm) ||
      (b.resourceTitle || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[1.2rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="text-emerald-700" size={22} /> Bookings & Reservations
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage reservations, deposits, booking sources, and service completion.
          </p>
        </div>

        <button
          onClick={() => setShowBookingModal(true)}
          className="px-4 py-2.5 bg-[#0D4A3E] text-white font-black text-xs uppercase tracking-wider rounded-[.5rem] hover:bg-[#08362D] transition-all flex items-center gap-2 shadow-lg"
        >
          <Plus size={16} /> New Booking
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-[1.2rem] border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search customer, phone, or unit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-bold text-slate-400">Status:</span>
          {['ALL', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-[1.2rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="animate-spin text-emerald-600" size={28} />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 p-8">
            <CalendarCheck size={40} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Bookings Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-medium">
              No reservations match your current search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Unit / Resource</th>
                  <th className="p-4">Channel</th>
                  <th className="p-4">Dates</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Paid / Balance</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredBookings.map((b) => {
                  const hasBalance = Number(b.balance) > 0;
                  const isCheckedOut = b.status === 'CHECKED_OUT';

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{b.customerName || b.guestName || 'Customer'}</div>
                        <div className="text-[11px] text-slate-400 font-medium">{b.customerPhone || 'No Phone'}</div>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">{b.resourceTitle || 'Room'}</span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">{b.resourceType || 'Unit'}</span>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[10px] uppercase">
                          {b.meta?.bookingSource || 'Direct'}
                        </span>
                      </td>

                      <td className="p-4 text-[11px] font-medium text-slate-600">
                        {b.startTime ? new Date(b.startTime).toLocaleDateString() : 'N/A'} - {b.endTime ? new Date(b.endTime).toLocaleDateString() : 'N/A'}
                        <div className="text-[10px] text-emerald-700 font-bold">{b.meta?.duration || b.meta?.nights || 1} Unit(s)</div>
                      </td>

                      <td className="p-4 font-bold text-slate-900">
                        KES {Number(b.totalAmount).toLocaleString()}
                      </td>

                      <td className="p-4">
                        <div className="text-emerald-700 font-bold">
                          Paid: KES {Number(b.paidAmount).toLocaleString()}
                        </div>
                        {hasBalance ? (
                          <div className="text-amber-600 font-bold text-[10px]">
                            Bal: KES {Number(b.balance).toLocaleString()}
                          </div>
                        ) : (
                          <div className="text-emerald-600 text-[10px] font-bold">Fully Cleared</div>
                        )}
                      </td>

                      <td className="p-4">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          b.status === 'CHECKED_IN'
                            ? 'bg-blue-100 text-blue-800'
                            : b.status === 'CHECKED_OUT'
                            ? 'bg-purple-100 text-purple-800'
                            : b.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {b.status}
                        </span>
                      </td>

                      <td className="p-4 text-right space-x-2">
                        {hasBalance && (
                          <button
                            onClick={() => {
                              setSelectedBooking(b);
                              setShowPaymentModal(true);
                            }}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            + Pay Balance
                          </button>
                        )}

                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleStatusChange(b.id, 'CHECKED_IN')}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold text-[10px] rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            Start
                          </button>
                        )}

                        {b.status === 'CHECKED_IN' && (
                          <button
                            onClick={() => handleStatusChange(b.id, 'CHECKED_OUT')}
                            className="px-2.5 py-1 bg-purple-50 text-purple-700 font-bold text-[10px] rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-1 inline-flex"
                          >
                            <LogOut size={12} /> Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[1.2rem] w-full max-w-lg p-6 relative shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">New Booking / Reservation</h3>
                <button onClick={() => setShowBookingModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateBooking} className="space-y-4">
                {/* Select Room */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Select Unit / Resource *</label>
                  <select
                    required
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                  >
                    <option value="">Select Unit...</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.title} ({r.status}) - KES {Number(r.basePrice).toLocaleString()}/unit
                      </option>
                    ))}
                  </select>
                </div>

                {/* Guest Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Customer Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Customer Phone *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 0712345678"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* Dates & Nights */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Duration</label>
                    <input
                      type="number"
                      min="1"
                      value={duration}
                      onChange={(e) => handleDurationChange(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* Pricing & Booking Source */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Rate / Unit (KES)</label>
                    <input
                      type="number"
                      value={ratePerUnit}
                      onChange={(e) => {
                        const r = parseFloat(e.target.value) || 0;
                        setRatePerUnit(e.target.value);
                        recalculateTotal(r, duration);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Channel / Source</label>
                    <select
                      value={bookingSource}
                      onChange={(e) => setBookingSource(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                    >
                      <option value="Direct">Direct / Walk-in</option>
                      <option value="WhatsApp">WhatsApp / Phone</option>
                      <option value="Online">Online Platform</option>
                      <option value="Agent">Agent / Referral</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Total & Deposit Paid */}
                <div className="grid grid-cols-2 gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div>
                    <label className="text-[10px] font-black text-emerald-900 uppercase tracking-widest block mb-1">Total Amount</label>
                    <div className="text-xl font-black text-emerald-900">
                      KES {Number(totalAmount).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-emerald-900 uppercase tracking-widest block mb-1">Amount Paid Now (Deposit)</label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      className="w-full bg-white border border-emerald-200 rounded-lg p-2.5 text-sm font-bold text-slate-900 outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                  >
                    <option value="MPESA">M-Pesa</option>
                    <option value="CASH">Cash</option>
                    <option value="BANK">Bank Transfer</option>
                    <option value="CARD">Card</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-[#0D4A3E] text-white font-black text-xs uppercase tracking-wider rounded-lg hover:bg-[#08362D] transition-all flex items-center justify-center shadow-lg disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Save Booking'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Record Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[1.2rem] w-full max-w-md p-6 relative shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Record Payment</h3>
                <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X size={20} />
                </button>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-amber-900 text-xs">
                <div className="font-bold">{selectedBooking.guestName || 'Customer'} ({selectedBooking.resourceTitle})</div>
                <div>Outstanding Balance: <span className="font-black">KES {Number(selectedBooking.balance).toLocaleString()}</span></div>
              </div>

              <form onSubmit={handleRecordPayment} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Payment Amount (KES) *</label>
                  <input
                    type="number"
                    required
                    max={selectedBooking.balance}
                    placeholder={`Max KES ${selectedBooking.balance}`}
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Payment Method</label>
                  <select
                    value={topupMethod}
                    onChange={(e) => setTopupMethod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                  >
                    <option value="MPESA">M-Pesa</option>
                    <option value="CASH">Cash</option>
                    <option value="BANK">Bank Transfer</option>
                    <option value="CARD">Card</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-[#0D4A3E] text-white font-black text-xs uppercase tracking-wider rounded-lg hover:bg-[#08362D] transition-all flex items-center justify-center shadow-lg disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Record Payment & Sync Revenue'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
