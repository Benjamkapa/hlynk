import { useState, useEffect, useRef } from "react";
import {
  Building, Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, Sparkles,
  Loader2, DollarSign, Tag, Layers, X, Camera, Image as ImageIcon,
  ChevronLeft, ChevronRight, Eye, UploadCloud, Star, Link as LinkIcon
} from "lucide-react";
import { resourcesApi, Resource } from "../../../lib/api/universal";
import { CameraCapture } from "../../../components/shared/CameraCapture";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const PRESET_PHOTOS = [
  { name: "Luxury Suite", url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800" },
  { name: "Deluxe Room", url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800" },
  { name: "BnB Studio", url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800" },
  { name: "Executive SUV", url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800" },
  { name: "Apartment", url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800" },
  { name: "Conference Hall", url: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=800" },
];

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Resource[]>([]);
  const [rooms, setRooms] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Camera Modal State
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Photo Gallery Viewer State
  const [galleryImages, setGalleryImages] = useState<string[] | null>(null);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryIndex, setGalleryIndex] = useState(0);

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
  const [roomDescription, setRoomDescription] = useState("");
  
  // Room Photos State (Base64 data strings or URLs)
  const [roomPhotos, setRoomPhotos] = useState<string[]>([]);
  const [customUrlInput, setCustomUrlInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const openAddUnitModal = () => {
    setEditingResource(null);
    setRoomTitle("");
    setRoomCode("");
    setRoomType("Standard");
    setRoomParentId("");
    setRoomPrice("");
    setRoomAmenities("WiFi, TV, Hot Shower");
    setRoomDescription("");
    setRoomPhotos([]);
    setCustomUrlInput("");
    setShowRoomModal(true);
  };

  const openEditUnitModal = (unit: Resource) => {
    setEditingResource(unit);
    setRoomTitle(unit.title);
    setRoomCode(unit.code || "");
    setRoomType(unit.meta?.roomType || "Standard");
    setRoomParentId(unit.parentId || "");
    setRoomPrice(unit.basePrice.toString());
    setRoomAmenities(Array.isArray(unit.meta?.amenities) ? unit.meta.amenities.join(", ") : (unit.meta?.amenities || "WiFi, TV, Hot Shower"));
    setRoomDescription(unit.meta?.description || "");

    const existingImgs: string[] = [];
    if (unit.meta?.imageUrl) existingImgs.push(unit.meta.imageUrl);
    if (Array.isArray(unit.meta?.images)) {
      unit.meta.images.forEach(img => {
        if (img && !existingImgs.includes(img)) existingImgs.push(img);
      });
    }
    setRoomPhotos(existingImgs);
    setCustomUrlInput("");
    setShowRoomModal(true);
  };

  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // Upload Local File(s) via Backend Storage API
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadingPhotos(true);
    const toastId = toast.loading(`Uploading ${files.length} photo(s)...`);

    try {
      const uploadPromises = files.map(file => {
        if (!file.type.startsWith('image/')) {
          toast.error(`File "${file.name}" is not a valid image`);
          return null;
        }
        return resourcesApi.uploadPhoto(file);
      });

      const uploadedUrls = (await Promise.all(uploadPromises)).filter(Boolean) as string[];
      if (uploadedUrls.length > 0) {
        setRoomPhotos(prev => [...prev, ...uploadedUrls]);
        toast.success(`Successfully uploaded ${uploadedUrls.length} photo(s)`, { id: toastId });
      } else {
        toast.dismiss(toastId);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo(s)", { id: toastId });
    } finally {
      setUploadingPhotos(false);
      e.target.value = "";
    }
  };

  // Camera Capture Handler
  const handleCameraCapture = async (file: File) => {
    const toastId = toast.loading("Uploading captured photo...");
    try {
      const url = await resourcesApi.uploadPhoto(file);
      setRoomPhotos(prev => [url, ...prev]);
      toast.success("Captured photo uploaded!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo", { id: toastId });
    }
  };

  // Add URL manually
  const handleAddCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    setRoomPhotos(prev => [...prev, customUrlInput.trim()]);
    setCustomUrlInput("");
    toast.success("Image URL added");
  };

  // Set Photo as Primary Cover
  const setPrimaryPhoto = (index: number) => {
    setRoomPhotos(prev => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
    toast.success("Set as primary cover photo");
  };

  // Remove Photo
  const removePhoto = (index: number) => {
    setRoomPhotos(prev => prev.filter((_, i) => i !== index));
  };

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

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomTitle.trim() || !roomPrice) return toast.error("Unit title and base rate are required");
    setSubmitting(true);
    try {
      const amenitiesList = roomAmenities.split(',').map(a => a.trim()).filter(Boolean);

      const payload = {
        type: 'ROOM',
        title: roomTitle,
        code: roomCode,
        parentId: roomParentId || undefined,
        basePrice: parseFloat(roomPrice) || 0,
        status: editingResource ? editingResource.status : 'AVAILABLE',
        meta: {
          ...(editingResource?.meta || {}),
          roomType,
          amenities: amenitiesList,
          description: roomDescription,
          imageUrl: roomPhotos[0] || '',
          images: roomPhotos
        }
      };

      if (editingResource) {
        await resourcesApi.updateResource(editingResource.id, payload);
        toast.success("Unit updated successfully!");
      } else {
        await resourcesApi.createResource(payload);
        toast.success("Unit created successfully!");
      }

      setShowRoomModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save unit");
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

  const openGallery = (images: string[], title: string) => {
    setGalleryImages(images);
    setGalleryTitle(title);
    setGalleryIndex(0);
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
            Create resource groups, upload photos, manage rates, and track availability statuses.
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
            onClick={openAddUnitModal}
            className="px-4 py-2.5 bg-[#0D4A3E] text-white font-black text-xs uppercase tracking-wider rounded-[.5rem] hover:bg-[#08362D] transition-all flex items-center gap-2 shadow-lg"
          >
            <Plus size={15} /> Add Unit / Property
          </button>
        </div>
      </div>

      {/* Properties List Header */}
      {properties.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          <span className="text-xs font-bold text-slate-500 mr-2">Properties / Groups:</span>
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
            Start by adding units or resources (e.g. Deluxe Room, Car: Toyota Axio, Executive Suite).
          </p>
          <button
            onClick={openAddUnitModal}
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

            const statusBadgeColor = isOccupied
              ? 'bg-blue-600 text-white'
              : isCleaning
              ? 'bg-purple-600 text-white'
              : isMaintenance
              ? 'bg-amber-600 text-white'
              : 'bg-emerald-600 text-white';

            const parentProperty = properties.find(p => p.id === room.parentId);

            const displayImage = room.meta?.imageUrl || (Array.isArray(room.meta?.images) && room.meta.images[0]);
            const allImagesList = Array.isArray(room.meta?.images) && room.meta.images.length > 0
              ? room.meta.images
              : (displayImage ? [displayImage] : []);

            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[1.2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow"
              >
                {/* Visual Image Header */}
                <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt={room.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-900 to-slate-900 flex flex-col items-center justify-center text-slate-300">
                      <Building size={36} className="opacity-40 mb-1" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Image Attached</span>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-md backdrop-blur-sm ${statusBadgeColor}`}>
                      {room.status}
                    </span>
                  </div>

                  {/* Photos Badge / Gallery Button */}
                  {allImagesList.length > 0 && (
                    <button
                      onClick={() => openGallery(allImagesList, room.title)}
                      className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <Camera size={12} /> {allImagesList.length} {allImagesList.length === 1 ? 'Photo' : 'Photos'}
                    </button>
                  )}

                  {/* Title & Group on Image Bottom */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 block">
                      {parentProperty ? parentProperty.title : (room.meta?.roomType || 'Unit')}
                    </span>
                    <h3 className="text-lg font-black tracking-tight leading-snug drop-shadow-sm">{room.title}</h3>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Rate / Night</span>
                      <span className="text-xl font-black text-slate-900">
                        KES {Number(room.basePrice).toLocaleString()}
                      </span>
                    </div>
                    {room.code && (
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Code / Unit #</span>
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{room.code}</span>
                      </div>
                    )}
                  </div>

                  {/* Description snippet if any */}
                  {room.meta?.description && (
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {room.meta.description}
                    </p>
                  )}

                  {/* Amenities */}
                  {Array.isArray(room.meta?.amenities) && room.meta.amenities.length > 0 && (
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Amenities & Specs</span>
                      <div className="flex flex-wrap gap-1">
                        {room.meta.amenities.map((a: string, idx: number) => (
                          <span key={idx} className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-md">
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

                {/* Footer Action Bar */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => openEditUnitModal(room)}
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1.5"
                  >
                    <Edit2 size={13} /> Edit Unit
                  </button>

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

      {/* Property Group Modal */}
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
                <h3 className="text-lg font-bold text-slate-900">Add Property Group</h3>
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
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Save Property Group'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Unit / Room Modal (Add & Edit with File Upload & Camera Support) */}
      <AnimatePresence>
        {showRoomModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[1.2rem] w-full max-w-xl p-6 relative shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingResource ? `Edit Unit: ${editingResource.title}` : 'Add Unit / Property'}
                </h3>
                <button onClick={() => setShowRoomModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveRoom} className="space-y-4">
                {/* Title & Code */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Unit Title / Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Deluxe Room 101, Car: Axio, Studio A"
                      value={roomTitle}
                      onChange={(e) => setRoomTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Code / Unit Number</label>
                    <input
                      type="text"
                      placeholder="e.g. RM-101, KCG-123X"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* Group & Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Property Group (Optional)</label>
                    <select
                      value={roomParentId}
                      onChange={(e) => setRoomParentId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                    >
                      <option value="">No Property (Standalone Unit)</option>
                      {properties.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Unit Category</label>
                    <select
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Premium">Premium</option>
                      <option value="Executive">Executive</option>
                      <option value="Suite">Suite</option>
                      <option value="Vehicle">Vehicle / Rental</option>
                      <option value="Budget">Budget</option>
                    </select>
                  </div>
                </div>

                {/* Base Rate & Amenities */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Base Rate (KES) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="100"
                      placeholder="e.g. 3500"
                      value={roomPrice}
                      onChange={(e) => setRoomPrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Amenities (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="WiFi, AC, Ocean View, Automatic"
                      value={roomAmenities}
                      onChange={(e) => setRoomAmenities(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Unit Description (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Describe the unit layout, features, and condition..."
                    value={roomDescription}
                    onChange={(e) => setRoomDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-medium text-slate-800 outline-none focus:border-emerald-600"
                  />
                </div>

                {/* --- IMAGE UPLOADER SECTION --- */}
                <div className="space-y-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest block">
                        Unit Photos & Gallery
                      </label>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Upload images from your device or capture using your camera.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-[#0D4A3E] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-[#08362D] transition-colors"
                      >
                        <UploadCloud size={14} /> Upload Photos
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsCameraOpen(true)}
                        className="px-3 py-1.5 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-200 transition-colors"
                      >
                        <Camera size={14} /> Camera
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>

                  {/* Photo Dropzone Container */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white rounded-xl p-4 text-center cursor-pointer transition-colors group"
                  >
                    <UploadCloud size={28} className="mx-auto text-slate-400 group-hover:text-emerald-600 group-hover:scale-110 transition-all mb-1" />
                    <p className="text-xs font-bold text-slate-700">Click or drag images here to upload from device</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Supports PNG, JPG, WEBP formats</p>
                  </div>

                  {/* Attached Photos Thumbnail Manager */}
                  {roomPhotos.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 mb-1.5">
                        <span>Attached Photos ({roomPhotos.length})</span>
                        <span className="text-emerald-700">★ Photo 1 is Primary Cover</span>
                      </div>

                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                        {roomPhotos.map((img, idx) => (
                          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group bg-slate-900">
                            <img src={img} alt={`Uploaded ${idx}`} className="w-full h-full object-cover" />

                            {idx === 0 && (
                              <div className="absolute top-1 left-1 bg-emerald-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow">
                                Cover
                              </div>
                            )}

                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                              {idx !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => setPrimaryPhoto(idx)}
                                  className="px-1.5 py-1 bg-emerald-500 text-white text-[9px] font-bold rounded flex items-center gap-1 hover:bg-emerald-600"
                                >
                                  <Star size={10} /> Make Cover
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removePhoto(idx)}
                                className="px-1.5 py-1 bg-red-600 text-white text-[9px] font-bold rounded flex items-center gap-1 hover:bg-red-700"
                              >
                                <Trash2 size={10} /> Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom URL Input Accordion / Option */}
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Or Add Image by URL</span>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://example.com/photo.jpg"
                        value={customUrlInput}
                        onChange={(e) => setCustomUrlInput(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-emerald-600"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomUrl}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <LinkIcon size={12} /> Add
                      </button>
                    </div>

                    {/* Stock Presets */}
                    <div className="mt-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Or Sample Stock Presets:</span>
                      <div className="flex flex-wrap gap-1">
                        {PRESET_PHOTOS.map((p) => (
                          <button
                            type="button"
                            key={p.name}
                            onClick={() => {
                              if (!roomPhotos.includes(p.url)) {
                                setRoomPhotos(prev => [...prev, p.url]);
                                toast.success(`Added ${p.name} photo`);
                              }
                            }}
                            className="px-2 py-0.5 bg-white hover:bg-emerald-50 hover:text-emerald-800 text-[9px] font-bold text-slate-600 rounded border border-slate-200 transition-colors"
                          >
                            + {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-[#0D4A3E] text-white font-black text-xs uppercase tracking-wider rounded-lg hover:bg-[#08362D] transition-all flex items-center justify-center shadow-lg disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : (editingResource ? 'Save Changes' : 'Create Unit')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Camera Capture Modal */}
      {isCameraOpen && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setIsCameraOpen(false)}
        />
      )}

      {/* Photo Gallery Fullscreen Modal */}
      <AnimatePresence>
        {galleryImages && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl max-h-[90vh] flex flex-col items-center justify-between p-4"
            >
              {/* Top Bar */}
              <div className="w-full flex items-center justify-between text-white pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-base font-bold">{galleryTitle}</h3>
                  <span className="text-xs text-slate-400 font-medium">
                    Photo {galleryIndex + 1} of {galleryImages.length}
                  </span>
                </div>
                <button
                  onClick={() => setGalleryImages(null)}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Image View */}
              <div className="relative my-6 w-full flex-1 flex items-center justify-center overflow-hidden max-h-[65vh]">
                <img
                  src={galleryImages[galleryIndex]}
                  alt="Unit photo"
                  className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                />

                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setGalleryIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
                      className="absolute left-2 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={() => setGalleryIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
                      className="absolute right-2 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails bar */}
              {galleryImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto max-w-full p-2">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setGalleryIndex(idx)}
                      className={`h-14 w-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                        idx === galleryIndex ? 'border-emerald-400 scale-105' : 'border-transparent opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
