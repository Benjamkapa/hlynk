import { useState, useEffect } from "react";
import { Sparkles, Wrench, Plus, CheckCircle2, Loader2 } from "lucide-react";
import { operationsApi, resourcesApi, OperationTask, Resource } from "../../../lib/api/universal";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Modal } from "../../../components/shared/Modal";

export default function OperationsPage() {
  const [operations, setOperations] = useState<OperationTask[]>([]);
  const [rooms, setRooms] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
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
    try {
      const [opData, roomData] = await Promise.all([
        operationsApi.getOperations(),
        resourcesApi.getResources({}),
      ]);
      setOperations(opData);
      setRooms(roomData);
    } catch (err: any) {
      toast.error("Failed to load tasks", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !title.trim()) return toast.error("Select a unit and enter a task description");
    setSubmitting(true);
    try {
      await operationsApi.createOperation({
        resourceId: selectedRoomId,
        opType,
        title,
        status: "PENDING",
        estimatedCost: parseFloat(estimatedCost) || 0,
      });
      toast.success("Task logged");
      setShowModal(false);
      setTitle(""); setEstimatedCost("");
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
      await operationsApi.updateOperation(selectedTask.id, { status: "COMPLETED", actualCost: cost });
      toast.success(cost > 0 ? "Task done — expense logged!" : "Task marked complete");
      setShowCompleteModal(false);
      setActualCost("");
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to complete task");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTasks = operations.filter((o) => o.opType === activeTab);
  const pendingCleaning = operations.filter((o) => o.opType === "CLEANING" && o.status !== "COMPLETED").length;
  const pendingMaintenance = operations.filter((o) => o.opType === "MAINTENANCE" && o.status !== "COMPLETED").length;

  return (
    // <div className="max-w-3xl mx-auto pb-20 px-1">
    <div className="space-y-8 pt-4">
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
          <Sparkles size={13} /> Cleaning
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
            className="mt-4 text-sm font-medium text-slate-900 underline underline-offset-2"
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
