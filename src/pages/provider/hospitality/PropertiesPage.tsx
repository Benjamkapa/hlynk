import { useState, useEffect } from "react";
import {
  Building, Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, Sparkles,
  Loader2, DollarSign, Tag, Layers, X
} from "lucide-react";
import { resourcesApi, Resource } from "../../../lib/api/universal";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Resource[]>([]);
  const [rooms, setRooms] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Property Form State
  const [propName, setPropName] = useState("");
  const [propAddress, setPropAddress] = useState("");

  // Room Form State
  const [roomTitle, setRoomTitle] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [roomType, setRoomType] = useState("Standard");
  const [roomParentId, setRoomParentId] = useState("");
  const [roomPrice, setRoomPrice] = useState("");
  const [roomAmenities, setRoomAmenities] = useState("WiFi, TV, Hot Shower");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [propsData, unitsData] = await Promise.all([
        resourcesApi.getResources({ type: 'PROPERTY' }),
        resourcesApi.getResources({})
      ]);
      setProperties(propsData);
      setRooms(unitsData);
    } catch (err: any) {
      toast.error("Failed to load properties and rooms", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propName.trim()) return toast.error("Property name is required");
    setSubmitting(true);
    try {
      await resourcesApi.createResource({
        type: 'PROPERTY',
        title: propName,
        meta: { address: propAddress }
      });
      toast.success("Property created successfully!");
      setPropName("");
      setPropAddress("");
      setShowPropertyModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create property");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomTitle.trim() || !roomPrice) return toast.error("Unit title and base rate are required");
    setSubmitting(true);
    try {
      const amenitiesList = roomAmenities.split(',').map(a => a.trim()).filter(Boolean);
      await resourcesApi.createResource({
        type: 'ROOM',
        title: roomTitle,
        code: roomCode,
        parentId: roomParentId || undefined,
        basePrice: parseFloat(roomPrice) || 0,
        status: 'AVAILABLE',
        meta: {
          roomType,
          amenities: amenitiesList
        }
      });
      toast.success("Unit created successfully!");
      setRoomTitle("");
      setRoomCode("");
      setRoomPrice("");
      setShowRoomModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create room");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (roomId: string, newStatus: string) => {
    try {
      await resourcesApi.updateResource(roomId, { status: newStatus });
      toast.success(`Unit status updated to ${newStatus}`);
      fetchData();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to update status";
      toast.error("Failed to update status", { description: msg });
    }
  };

  const handleDeleteResource = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await resourcesApi.deleteResource(id);
      toast.success("Deleted successfully");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[1.2rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building className="text-emerald-700" size={22} /> Resources & Units Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Create resource groups and manage unit rates, availability, and statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPropertyModal(true)}
            className="px-4 py-2.5 bg-slate-100 text-slate-800 font-bold text-xs rounded-[.5rem] hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            <Plus size={15} /> Add Group
          </button>
          <button
            onClick={() => setShowRoomModal(true)}
            className="px-4 py-2.5 bg-[#0D4A3E] text-white font-black text-xs uppercase tracking-wider rounded-[.5rem] hover:bg-[#08362D] transition-all flex items-center gap-2 shadow-lg"
          >
            <Plus size={15} /> Add Unit
          </button>
        </div>
      </div>

      {/* Properties List Header */}
      {properties.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          <span className="text-xs font-bold text-slate-500 mr-2">Properties:</span>
          {properties.map((p) => (
            <div key={p.id} className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-800 flex items-center gap-2 shadow-sm whitespace-nowrap">
              <Building size={14} className="text-emerald-600" />
              {p.title}
              <button
                onClick={() => handleDeleteResource(p.id, p.title)}
                className="text-slate-400 hover:text-red-600 transition-colors ml-1"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Rooms Grid */}
      {loading ? (
        <div className="h-64 flex items-center justify-center bg-white rounded-[1.2rem] border border-slate-100">
          <Loader2 className="animate-spin text-emerald-600" size={28} />
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[1.2rem] border-2 border-dashed border-slate-200 p-8">
          <Building size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Units Added Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-medium">
            Start by adding units or resources (e.g. Bay 1, Car: Toyota Axio, Equipment A).
          </p>
          <button
            onClick={() => setShowRoomModal(true)}
            className="mt-4 px-5 py-2.5 bg-[#0D4A3E] text-white font-bold text-xs uppercase tracking-wider rounded-[.5rem] hover:bg-[#08362D] transition-all inline-flex items-center gap-2 shadow-md"
          >
            <Plus size={16} /> Add Unit Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const isOccupied = room.status === 'OCCUPIED';
            const isCleaning = room.status === 'CLEANING';
            const isMaintenance = room.status === 'MAINTENANCE';

            const cardHeaderColor = isOccupied
              ? 'bg-blue-600 text-white'
              : isCleaning
              ? 'bg-purple-600 text-white'
              : isMaintenance
              ? 'bg-amber-600 text-white'
              : 'bg-emerald-800 text-white';

            const parentProperty = properties.find(p => p.id === room.parentId);

            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[1.2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                {/* Header */}
                <div className={`p-4 ${cardHeaderColor} flex items-center justify-between`}>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80 block">
                      {parentProperty ? parentProperty.title : (room.meta?.roomType || 'Unit')}
                    </span>
                    <h3 className="text-lg font-black tracking-tight leading-tight">{room.title}</h3>
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg">
                    {room.status}
                  </span>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Rate / Night</span>
                      <span className="text-xl font-black text-slate-900">
                        KES {Number(room.basePrice).toLocaleString()}
                      </span>
                    </div>
                    {room.code && (
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Code / Room #</span>
                        <span className="text-xs font-bold text-slate-700">{room.code}</span>
                      </div>
                    )}
                  </div>

                  {/* Amenities */}
                  {Array.isArray(room.meta?.amenities) && room.meta.amenities.length > 0 && (
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Amenities</span>
                      <div className="flex flex-wrap gap-1">
                        {room.meta.amenities.map((a: string, idx: number) => (
                          <span key={idx} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status Toggle Buttons */}
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Change Status</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE'].map((st) => (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(room.id, st)}
                          disabled={room.status === st}
                          className={`py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all border ${
                            room.status === st
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">ID: {room.id.slice(-8)}</span>
                  <button
                    onClick={() => handleDeleteResource(room.id, room.title)}
                    className="text-xs text-red-600 hover:text-red-800 font-bold flex items-center gap-1"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Property Modal */}
      <AnimatePresence>
        {showPropertyModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[1.2rem] w-full max-w-md p-6 relative shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Add Resource Group</h3>
                <button onClick={() => setShowPropertyModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateProperty} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Property Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Main Garage, Fleet Alpha, Block A"
                    value={propName}
                    onChange={(e) => setPropName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Address / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Kilimani, Nairobi"
                    value={propAddress}
                    onChange={(e) => setPropAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-[#0D4A3E] text-white font-black text-xs uppercase tracking-wider rounded-lg hover:bg-[#08362D] transition-all flex items-center justify-center shadow-lg disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Save Property'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Room Modal */}
      <AnimatePresence>
        {showRoomModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[1.2rem] w-full max-w-lg p-6 relative shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Add Unit / Resource</h3>
                <button onClick={() => setShowRoomModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Unit Title / Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bay 1, Car: Axio, Slot A"
                      value={roomTitle}
                      onChange={(e) => setRoomTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Code / Unit Number</label>
                    <input
                      type="text"
                      placeholder="e.g. U01, BAY-2"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Group (Optional)</label>
                    <select
                      value={roomParentId}
                      onChange={(e) => setRoomParentId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                    >
                      <option value="">No Property (Standalone)</option>
                      {properties.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Unit Type / Category</label>
                    <select
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Premium">Premium</option>
                      <option value="VIP">VIP</option>
                      <option value="Budget">Budget</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Base Rate (KES) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="100"
                      placeholder="e.g. 2500"
                      value={roomPrice}
                      onChange={(e) => setRoomPrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Amenities (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="Features, Specs, Inclusions"
                      value={roomAmenities}
                      onChange={(e) => setRoomAmenities(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-[#0D4A3E] text-white font-black text-xs uppercase tracking-wider rounded-lg hover:bg-[#08362D] transition-all flex items-center justify-center shadow-lg disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Save Unit'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
