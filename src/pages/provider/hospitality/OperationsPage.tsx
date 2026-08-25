import { useState, useEffect } from "react";
import {
  Sparkles, Wrench, Plus, CheckCircle2, Clock, AlertTriangle, Loader2, DollarSign, X
} from "lucide-react";
import { operationsApi, resourcesApi, OperationTask, Resource } from "../../../lib/api/universal";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function OperationsPage() {
  const [operations, setOperations] = useState<OperationTask[]>([]);
  const [rooms, setRooms] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'CLEANING' | 'MAINTENANCE'>('CLEANING');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [opType, setOpType] = useState<'CLEANING' | 'MAINTENANCE'>('CLEANING');
  const [title, setTitle] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");

  // Complete Task Modal
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<OperationTask | null>(null);
  const [actualCost, setActualCost] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [opData, roomData] = await Promise.all([
        operationsApi.getOperations(),
        resourcesApi.getResources({ type: 'ROOM' })
      ]);
      setOperations(opData);
      setRooms(roomData);
    } catch (err: any) {
      toast.error("Failed to load operations tasks", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !title.trim()) {
      return toast.error("Please select a room and enter a task title");
    }

    setSubmitting(true);
    try {
      await operationsApi.createOperation({
        resourceId: selectedRoomId,
        opType,
        title,
        status: 'PENDING',
        estimatedCost: parseFloat(estimatedCost) || 0
      });

      toast.success(`${opType === 'CLEANING' ? 'Housekeeping' : 'Maintenance'} task created!`);
      setShowModal(false);
      setTitle("");
      setEstimatedCost("");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    setSubmitting(true);
    try {
      const cost = parseFloat(actualCost) || 0;
      await operationsApi.updateOperation(selectedTask.id, {
        status: 'COMPLETED',
        actualCost: cost
      });

      if (cost > 0) {
        toast.success("Task completed & expense auto-synced to Core Ledger!");
      } else {
        toast.success("Task marked as completed!");
      }

      setShowCompleteModal(false);
      setActualCost("");
      fetchData();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to complete task";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTasks = operations.filter(o => o.opType === activeTab);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[1.2rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="text-purple-600" size={22} /> Housekeeping & Maintenance
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Track room cleaning queues and maintenance tickets. Repairs auto-feed into Core Expenses.
          </p>
        </div>

        <button
          onClick={() => {
            setOpType(activeTab);
            setShowModal(true);
          }}
          className="px-4 py-2.5 bg-[#0D4A3E] text-white font-black text-xs uppercase tracking-wider rounded-[.5rem] hover:bg-[#08362D] transition-all flex items-center gap-2 shadow-lg"
        >
          <Plus size={16} /> Log {activeTab === 'CLEANING' ? 'Housekeeping Task' : 'Maintenance Ticket'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('CLEANING')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'CLEANING'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Sparkles size={16} /> Housekeeping Queue ({operations.filter(o => o.opType === 'CLEANING' && o.status !== 'COMPLETED').length})
        </button>

        <button
          onClick={() => setActiveTab('MAINTENANCE')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'MAINTENANCE'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Wrench size={16} /> Maintenance & Repairs ({operations.filter(o => o.opType === 'MAINTENANCE' && o.status !== 'COMPLETED').length})
        </button>
      </div>

      {/* Operations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full h-48 flex items-center justify-center">
            <Loader2 className="animate-spin text-emerald-600" size={28} />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-[1.2rem] border-2 border-dashed border-slate-200 p-8">
            <CheckCircle2 size={40} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              No Pending {activeTab === 'CLEANING' ? 'Housekeeping' : 'Maintenance'} Tasks
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-medium">
              All rooms are currently in good condition and ready for guests.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            const taskTitle = task.meta?.title || `${task.opType} for Unit`;

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[1.2rem] border border-slate-100 shadow-sm p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {task.resourceTitle || 'Room'}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-tight">{taskTitle}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Logged on: {new Date(task.createdAt).toLocaleDateString()}
                  </p>

                  {task.actualCost > 0 && (
                    <div className="mt-3 p-2 bg-emerald-50 rounded-lg border border-emerald-100 text-xs font-bold text-emerald-800">
                      Actual Cost: KES {Number(task.actualCost).toLocaleString()} (Synced to Core Expenses)
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">ID: {task.id.slice(-8)}</span>
                  {!isCompleted && (
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setShowCompleteModal(true);
                      }}
                      className="px-3 py-1.5 bg-emerald-700 text-white font-bold text-xs rounded-lg hover:bg-emerald-800 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 size={14} /> Mark Resolved
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* New Task Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[1.2rem] w-full max-w-md p-6 relative shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">
                  Log {opType === 'CLEANING' ? 'Housekeeping Task' : 'Maintenance Issue'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Select Room / Unit *</label>
                  <select
                    required
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                  >
                    <option value="">Select Room...</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.title} ({r.status})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Title / Description *</label>
                  <input
                    type="text"
                    required
                    placeholder={opType === 'CLEANING' ? "e.g. Deep clean after checkout" : "e.g. Leaking shower head"}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                  />
                </div>

                {opType === 'MAINTENANCE' && (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Estimated Cost (KES)</label>
                    <input
                      type="number"
                      placeholder="e.g. 1500"
                      value={estimatedCost}
                      onChange={(e) => setEstimatedCost(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-[#0D4A3E] text-white font-black text-xs uppercase tracking-wider rounded-lg hover:bg-[#08362D] transition-all flex items-center justify-center shadow-lg disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Save Task'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Complete Task Modal */}
      <AnimatePresence>
        {showCompleteModal && selectedTask && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[1.2rem] w-full max-w-md p-6 relative shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Resolve & Complete Task</h3>
                <button onClick={() => setShowCompleteModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X size={20} />
                </button>
              </div>

              <div className="text-xs font-bold text-slate-800">
                Resource: <span className="text-emerald-700">{selectedTask.resourceTitle}</span>
              </div>

              <form onSubmit={handleCompleteTask} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                    Actual Expense Cost (KES)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Enter cost (e.g. 1500) or leave 0 for free"
                    value={actualCost}
                    onChange={(e) => setActualCost(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                  />
                  <p className="text-[10px] text-slate-400 font-medium mt-1">
                    If cost &gt; 0, it will automatically record an entry in Hlynk Core Expenses.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-lg hover:bg-emerald-800 transition-all flex items-center justify-center shadow-lg disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Complete & Free Up Room'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
