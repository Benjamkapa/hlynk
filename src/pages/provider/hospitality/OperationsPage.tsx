import { useState, useEffect } from "react";
import { MopSparkles, Wrench, Plus, CheckCircle2, Loader2, WifiOff } from "lucide-react";
import { operationsApi, resourcesApi, OperationTask, Resource } from "../../../lib/api/universal";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Modal } from "../../../components/shared/Modal";
import { enqueueOperation } from "../../../lib/offline/db";

export default function OperationsPage() {
  const [operations, setOperations] = useState<OperationTask[]>([]);
  const [rooms, setRooms] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [activeTab, setActiveTab] = useState<"CLEANING" | "MAINTENANCE">("CLEANING");

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [opType, setOpType] = useState<"CLEANING" | "MAINTENANCE">("CLEANING");
  const [title, setTitle] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<OperationTask | null>(null);
  const [actualCost, setActualCost] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const offlineNow = typeof navigator !== "undefined" && !navigator.onLine;
    setIsOffline(offlineNow);

    if (offlineNow) {
      const cOps = localStorage.getItem("hlynk_cached_operations");
      const cUnits = localStorage.getItem("hlynk_cached_units");
      if (cOps) setOperations(JSON.parse(cOps));
      if (cUnits) setRooms(JSON.parse(cUnits));
      setLoading(false);
      return;
    }

    try {
      const [opData, roomData] = await Promise.all([
        operationsApi.getOperations(),
        resourcesApi.getResources({}),
      ]);
      setOperations(opData);
      setRooms(roomData);
      localStorage.setItem("hlynk_cached_operations", JSON.stringify(opData));
      localStorage.setItem("hlynk_cached_units", JSON.stringify(roomData));
    } catch (err: any) {
      const cOps = localStorage.getItem("hlynk_cached_operations");
      const cUnits = localStorage.getItem("hlynk_cached_units");
      if (cOps) setOperations(JSON.parse(cOps));
      if (cUnits) setRooms(JSON.parse(cUnits));
      if (navigator.onLine) {
        toast.error("Failed to load tasks", { description: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !title.trim()) return toast.error("Select a unit and enter a task description");
    setSubmitting(true);
    const room = rooms.find(r => r.id === selectedRoomId);
    const payload = {
      resourceId: selectedRoomId,
      opType,
      title,
      status: "PENDING",
      estimatedCost: parseFloat(estimatedCost) || 0,
    };

    if (!navigator.onLine) {
      const offlineId = "offline-task-" + Date.now();
      const newTask: OperationTask = {
        id: offlineId,
        tenantId: "local",
        resourceTitle: room?.title || "Unit",
        actualCost: 0,
        meta: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...payload,
      };
      const updated = [newTask, ...operations];
      setOperations(updated);
      localStorage.setItem("hlynk_cached_operations", JSON.stringify(updated));
      await enqueueOperation({ id: offlineId, action: "CREATE", payload, createdAt: Date.now() });
      toast.success("Task logged offline!", { description: "Stored locally. Will sync when back online." });
      setShowModal(false);
      setTitle(""); setEstimatedCost("");
      setSubmitting(false);
      return;
    }

    try {
      await operationsApi.createOperation(payload);
      toast.success("Task logged");
      setShowModal(false);
      setTitle(""); setEstimatedCost("");
      fetchData();
    } catch (err: any) {
      const offlineId = "offline-task-" + Date.now();
      const newTask: OperationTask = {
        id: offlineId,
        tenantId: "local",
        resourceTitle: room?.title || "Unit",
        actualCost: 0,
        meta: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...payload,
      };
      const updated = [newTask, ...operations];
      setOperations(updated);
      localStorage.setItem("hlynk_cached_operations", JSON.stringify(updated));
      await enqueueOperation({ id: offlineId, action: "CREATE", payload, createdAt: Date.now() });
      toast.success("Task saved offline (network issue)");
      setShowModal(false);
      setTitle(""); setEstimatedCost("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setSubmitting(true);
    const cost = parseFloat(actualCost) || 0;
    const payload = { status: "COMPLETED", actualCost: cost };

    if (!navigator.onLine) {
      const updated = operations.map(o => o.id === selectedTask.id ? { ...o, status: "COMPLETED", actualCost: cost } : o);
      setOperations(updated);
      localStorage.setItem("hlynk_cached_operations", JSON.stringify(updated));
      await enqueueOperation({ id: "comp-" + Date.now(), action: "UPDATE", targetId: selectedTask.id, payload, createdAt: Date.now() });
      toast.success(cost > 0 ? "Task done — expense logged (offline)!" : "Task marked complete (offline)");
      setShowCompleteModal(false);
      setActualCost("");
      setSubmitting(false);
      return;
    }

    try {
      await operationsApi.updateOperation(selectedTask.id, payload);
      toast.success(cost > 0 ? "Task done — expense logged!" : "Task marked complete");
      setShowCompleteModal(false);
      setActualCost("");
      fetchData();
    } catch (err: any) {
      const updated = operations.map(o => o.id === selectedTask.id ? { ...o, status: "COMPLETED", actualCost: cost } : o);
      setOperations(updated);
      localStorage.setItem("hlynk_cached_operations", JSON.stringify(updated));
      await enqueueOperation({ id: "comp-" + Date.now(), action: "UPDATE", targetId: selectedTask.id, payload, createdAt: Date.now() });
      toast.success("Task completed (saved offline)");
      setShowCompleteModal(false);
      setActualCost("");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTasks = operations.filter((o) => o.opType === activeTab);
  const pendingCleaning = operations.filter((o) => o.opType === "CLEANING" && o.status !== "COMPLETED").length;
  const pendingMaintenance = operations.filter((o) => o.opType === "MAINTENANCE" && o.status !== "COMPLETED").length;

  return (
    <div className="space-y-8 pt-4">
      {/* Offline Banner */}
      {isOffline && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-medium text-amber-800">
          <WifiOff size={15} className="text-amber-600 shrink-0" />
          <span>Offline Mode: Viewing cached task list.</span>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between py-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Tasks</h1>
          <p className="text-sm text-slate-500 mt-0.5">Cleaning, maintenance & servicing</p>
        </div>
        <button
          onClick={() => { setOpType(activeTab); setShowModal(true); }}
          className="flex items-center gap-1.5 bg-[#0D4A3E] text-white text-sm font-medium px-4 py-2.5 rounded-full hover:bg-slate-700 transition-colors"
        >
          <Plus size={15} /> Log task
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setActiveTab("CLEANING")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "CLEANING"
              ? "bg-[#0D4A3E] text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
          }`}
        >
          <MopSparkles size={13} /> Cleaning
          {pendingCleaning > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === "CLEANING" ? "bg-white/20" : "bg-slate-100"}`}>
              {pendingCleaning}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("MAINTENANCE")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "MAINTENANCE"
              ? "bg-[#0D4A3E] text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
          }`}
        >
          <Wrench size={13} /> Maintenance
          {pendingMaintenance > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === "MAINTENANCE" ? "bg-white/20" : "bg-slate-100"}`}>
              {pendingMaintenance}
            </span>
          )}
        </button>
      </div>

      {/* Tasks */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="animate-spin text-slate-400" size={24} />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <CheckCircle2 size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm font-medium">
            No {activeTab === "CLEANING" ? "cleaning" : "maintenance"} tasks
          </p>
          <button
            onClick={() => { setOpType(activeTab); setShowModal(true); }}
            className="mt-4 text-sm font-medium text-slate-900 bg-emerald-900 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-full"
          >
            Log a task
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => {
            const done = task.status === "COMPLETED";
            const taskTitle = task.meta?.title || `${task.opType} task`;
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-slate-900 text-sm">{taskTitle}</span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        done ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {done ? "Done" : "Pending"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {task.resourceTitle || "Unit"} · {new Date(task.createdAt).toLocaleDateString()}
                    </p>
                    {task.actualCost > 0 && (
                      <p className="text-xs text-emerald-700 mt-1 font-medium">
                        Cost: KES {Number(task.actualCost).toLocaleString()}
                      </p>
                    )}
                  </div>
                  {!done && (
                    <button
                      onClick={() => { setSelectedTask(task); setShowCompleteModal(true); }}
                      className="text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                    >
                      Mark done
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* New Task Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setTitle(""); setEstimatedCost(""); }}
        title="Log a task"
        maxWidth="sm"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">Unit *</label>
            <select
              required
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            >
              <option value="">Select unit...</option>
              {rooms.filter(r => r.type !== "PROPERTY").map((r) => (
                <option key={r.id} value={r.id}>{r.title} ({r.status})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">Task type</label>
            <div className="flex gap-2">
              {(["CLEANING", "MAINTENANCE"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setOpType(t)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors border ${
                    opType === t ? "bg-[#0D4A3E] text-white border-slate-900" : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  {t === "CLEANING" ? "Cleaning" : "Maintenance"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">Description *</label>
            <input
              required
              type="text"
              placeholder={opType === "CLEANING" ? "e.g. Deep clean after checkout" : "e.g. Oil change, broken AC"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            />
          </div>
          {opType === "MAINTENANCE" && (
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Estimated cost (KES)</label>
              <input
                type="number"
                placeholder="e.g. 1500"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#0D4A3E] text-white py-3 rounded-full text-sm font-semibold hover:bg-slate-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="animate-spin" size={16} /> : "Save task"}
          </button>
        </form>
      </Modal>

      {/* Complete Task Modal */}
      <Modal
        isOpen={showCompleteModal && !!selectedTask}
        onClose={() => { setShowCompleteModal(false); setActualCost(""); }}
        title="Complete task"
        maxWidth="sm"
      >
        {selectedTask && (
          <form onSubmit={handleCompleteTask} className="space-y-4">
            <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">
              <span className="font-semibold text-slate-900">{selectedTask.resourceTitle}</span> · {selectedTask.meta?.title || "Task"}
            </p>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Actual cost (KES)</label>
              <input
                type="number"
                min="0"
                placeholder="0 if no cost"
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              />
              <p className="text-xs text-slate-400 mt-1">Cost will be logged to expenses.</p>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-slate-900 text-white py-3 rounded-full text-sm font-semibold hover:bg-slate-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="animate-spin" size={16} /> : "Complete task"}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
