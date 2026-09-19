import { useState, useEffect, useRef } from "react";
import {
  Building, Plus, Edit2, Trash2, Loader2, X, Camera,
  UploadCloud, Star, ChevronLeft, ChevronRight, Link as LinkIcon,
  Eye, Share2
} from "lucide-react";
import { resourcesApi, Resource } from "../../../lib/api/universal";
import { CameraCapture } from "../../../components/shared/CameraCapture";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Modal } from "../../../components/shared/Modal";
import { useQuery } from "@tanstack/react-query";
import { providersApi } from "../../../lib/api/providers";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../lib/auth/AuthContext";
import { canAccessFeature } from "../../../components/shared/FeatureGate";

const PRESET_PHOTOS = [
  { name: "Luxury Suite",    url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800" },
  { name: "Deluxe Room",     url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800" },
  { name: "BnB Studio",      url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800" },
  { name: "Executive SUV",   url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800" },
  { name: "Apartment",       url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800" },
  { name: "Conference Hall", url: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=800" },
  { name: "Penthouse",       url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800" },
  { name: "Pool Villa",      url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800" },
  { name: "Sedan / Saloon",  url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800" },
  { name: "Minibus / Van",   url: "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800" },
  { name: "Event Hall",      url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800" },
  { name: "Modern Loft",     url: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800" },
];

const STATUS_STYLES: Record<string, string> = {
  AVAILABLE:   "bg-emerald-100 text-emerald-700",
  OCCUPIED:    "bg-blue-100 text-blue-700",
  CLEANING:    "bg-purple-100 text-purple-700",
  MAINTENANCE: "bg-amber-100 text-amber-700",
  RESERVED:    "bg-slate-100 text-slate-600",
};
const STATUS_LABELS: Record<string, string> = {
  AVAILABLE:   "Available",
  OCCUPIED:    "Occupied",
  CLEANING:    "Cleaning",
  MAINTENANCE: "Maintenance",
  RESERVED:    "Reserved",
};

export default function PropertiesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [properties, setProperties] = useState<Resource[]>([]);
  const [rooms, setRooms] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: providersApi.getMyProfile,
  });
  const slug = (profile as any)?.data?.slug;
  const publicListingUrl = slug ? `${window.location.origin}/stay/${slug}` : null;

  // Gallery
  const [galleryImages, setGalleryImages] = useState<string[] | null>(null);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Modals
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // Property form
  const [propName, setPropName] = useState("");
  const [propAddress, setPropAddress] = useState("");

  // Unit form
  const [roomTitle, setRoomTitle] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [roomType, setRoomType] = useState("Standard");
  const [roomParentId, setRoomParentId] = useState("");
  const [roomPrice, setRoomPrice] = useState("");
  const [roomAmenities, setRoomAmenities] = useState("WiFi, TV, Hot Shower");
  const [roomDescription, setRoomDescription] = useState("");
  const [roomPhotos, setRoomPhotos] = useState<string[]>([]);
  const [customUrlInput, setCustomUrlInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [propsData, allResources] = await Promise.all([
        resourcesApi.getResources({ type: "PROPERTY" }),
        resourcesApi.getResources({}),
      ]);
      setProperties(propsData);
      setRooms(allResources.filter((r: Resource) => r.type !== "PROPERTY"));
    } catch (err: any) {
      toast.error("Failed to load units", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Draft persistence
  useEffect(() => {
    if (showRoomModal && !editingResource) {
      const draft = { roomTitle, roomCode, roomType, roomParentId, roomPrice, roomAmenities, roomDescription, roomPhotos };
      localStorage.setItem("hlynk_unit_draft", JSON.stringify(draft));
    }
  }, [showRoomModal, editingResource, roomTitle, roomCode, roomType, roomParentId, roomPrice, roomAmenities, roomDescription, roomPhotos]);

  const clearDraftForm = () => {
    localStorage.removeItem("hlynk_unit_draft");
    setRoomTitle(""); setRoomCode(""); setRoomType("Standard");
    setRoomParentId(""); setRoomPrice(""); setRoomAmenities("WiFi, TV, Hot Shower");
    setRoomDescription(""); setRoomPhotos([]); setCustomUrlInput("");
  };

  const openAddUnitModal = () => {
    setEditingResource(null);
    const savedDraftStr = localStorage.getItem("hlynk_unit_draft");
    if (savedDraftStr) {
      try {
        const draft = JSON.parse(savedDraftStr);
        setRoomTitle(draft.roomTitle || "");
        setRoomCode(draft.roomCode || "");
        setRoomType(draft.roomType || "Standard");
        setRoomParentId(draft.roomParentId || "");
        setRoomPrice(draft.roomPrice || "");
        setRoomAmenities(draft.roomAmenities || "WiFi, TV, Hot Shower");
        setRoomDescription(draft.roomDescription || "");
        setRoomPhotos(Array.isArray(draft.roomPhotos) ? draft.roomPhotos : []);
        setShowRoomModal(true);
        if (draft.roomTitle || draft.roomPrice) {
          toast.info("Restored your unsaved draft!", {
            action: { label: "Clear", onClick: () => clearDraftForm() },
          });
        }
        return;
      } catch {}
    }
    clearDraftForm();
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
    if (Array.isArray(unit.meta?.images)) unit.meta.images.forEach((img: string) => { if (img && !existingImgs.includes(img)) existingImgs.push(img); });
    setRoomPhotos(existingImgs);
    setCustomUrlInput("");
    setShowRoomModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingPhotos(true);
    const toastId = toast.loading(`Uploading ${files.length} photo(s)...`);
    try {
      const uploaded = (await Promise.all(files.map(f => {
        if (!f.type.startsWith("image/")) { toast.error(`Not an image: ${f.name}`); return null; }
        return resourcesApi.uploadPhoto(f);
      }))).filter(Boolean) as string[];
      if (uploaded.length) {
        setRoomPhotos(prev => [...prev, ...uploaded]);
        toast.success(`Uploaded ${uploaded.length} photo(s)`, { id: toastId });
      } else {
        toast.dismiss(toastId);
      }
    } catch (err: any) {
      toast.error(err.message || "Upload failed", { id: toastId });
    } finally {
      setUploadingPhotos(false);
      e.target.value = "";
    }
  };

  const handleCameraCapture = async (file: File) => {
    const toastId = toast.loading("Uploading photo...");
    try {
      const url = await resourcesApi.uploadPhoto(file);
      setRoomPhotos(prev => [url, ...prev]);
      toast.success("Photo added!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Upload failed", { id: toastId });
    }
  };

  const handleAddCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    setRoomPhotos(prev => [...prev, customUrlInput.trim()]);
    setCustomUrlInput("");
    toast.success("Photo URL added");
  };

  const setPrimaryPhoto = (index: number) => {
    setRoomPhotos(prev => { const copy = [...prev]; const [s] = copy.splice(index, 1); return [s, ...copy]; });
    toast.success("Set as cover photo");
  };

  const removePhoto = (index: number) => setRoomPhotos(prev => prev.filter((_, i) => i !== index));

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propName.trim()) return toast.error("Group name is required");
    setSubmitting(true);
    try {
      await resourcesApi.createResource({ type: "PROPERTY", title: propName, meta: { address: propAddress } });
      toast.success("Group created!");
      setPropName(""); setPropAddress("");
      setShowPropertyModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create group");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomTitle.trim() || !roomPrice) return toast.error("Title and rate are required");
    setSubmitting(true);
    try {
      const amenitiesList = roomAmenities.split(",").map(a => a.trim()).filter(Boolean);
      const payload = {
        type: "ROOM",
        title: roomTitle,
        code: roomCode,
        parentId: roomParentId || undefined,
        basePrice: parseFloat(roomPrice) || 0,
        status: editingResource ? editingResource.status : "AVAILABLE",
        meta: { ...(editingResource?.meta || {}), roomType, amenities: amenitiesList, description: roomDescription, imageUrl: roomPhotos[0] || "", images: roomPhotos },
      };
      if (editingResource) {
        await resourcesApi.updateResource(editingResource.id, payload);
        toast.success("Unit updated!");
      } else {
        await resourcesApi.createResource(payload);
        toast.success("Unit added!");
      }
      localStorage.removeItem("hlynk_unit_draft");
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
      toast.success(`Marked ${STATUS_LABELS[newStatus] || newStatus}`);
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update");
    }
  };

  const handleDeleteResource = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await resourcesApi.deleteResource(id);
      toast.success("Deleted");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const handleShareListing = () => {
    if (!canAccessFeature(user, "stay_page")) {
      toast.error("Public Booking Page is on Business Pro", {
        action: { label: "Upgrade", onClick: () => navigate("/dashboard/subscription") },
      });
      return;
    }
    if (isProfileLoading) return toast.info("Loading link...");
    if (!publicListingUrl) return toast.error("Listing link unavailable");
    navigator.clipboard.writeText(publicListingUrl)
      .then(() => toast.success("Link copied!", { description: publicListingUrl }))
      .catch(() => toast.info(`Your link: ${publicListingUrl}`));
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 px-1">
      {/* Header */}
      <div className="flex items-center justify-between py-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Units</h1>
        </div>
        <div className="flex items-center gap-2">
          {publicListingUrl && (
            <button
              onClick={() => { if (canAccessFeature(user, "stay_page")) window.open(publicListingUrl, "_blank"); else handleShareListing(); }}
              className="p-2.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors"
              title="Preview listing"
            >
              <Eye size={15} className="text-slate-600" />
            </button>
          )}
          <button
            onClick={handleShareListing}
            className="p-2.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors"
            title="Share listing link"
          >
            <Share2 size={15} className="text-slate-600" />
          </button>
          <button
            onClick={() => { setPropName(""); setPropAddress(""); setShowPropertyModal(true); }}
            className="text-sm font-medium text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-full hover:bg-slate-50 transition-colors"
          >
            + Group
          </button>
          <button
            onClick={openAddUnitModal}
            className="flex items-center gap-1.5 bg-slate-900 text-white text-sm font-medium px-4 py-2.5 rounded-full hover:bg-slate-700 transition-colors"
          >
            <Plus size={15} /> Add unit
          </button>
        </div>
      </div>

      {/* Groups / Property tags */}
      {properties.length > 0 && (
        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
          <span className="text-xs text-slate-400 font-medium shrink-0">Groups:</span>
          {properties.map((p) => (
            <div key={p.id} className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-xs font-medium text-slate-700 shrink-0">
              <Building size={12} className="text-slate-400" />
              {p.title}
              <button onClick={() => handleDeleteResource(p.id, p.title)} className="text-slate-300 hover:text-red-500 transition-colors ml-0.5">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Units Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="animate-spin text-slate-400" size={24} />
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <Building size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm font-medium">No units added yet</p>
          <p className="text-xs text-slate-400 mt-1">Add rooms, vehicles, or any bookable asset</p>
          <button
            onClick={openAddUnitModal}
            className="mt-4 text-sm font-medium text-slate-900 underline underline-offset-2"
          >
            Add your first unit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => {
            const parentProperty = properties.find(p => p.id === room.parentId);
            const coverImg = room.meta?.imageUrl || (Array.isArray(room.meta?.images) && room.meta.images[0]) || null;
            const allImgs = Array.isArray(room.meta?.images) && room.meta.images.length > 0
              ? room.meta.images
              : coverImg ? [coverImg] : [];
            const badgeClass = STATUS_STYLES[room.status] || "bg-slate-100 text-slate-600";

            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-sm transition-shadow group"
              >
                {/* Image */}
                <div
                  className="relative h-44 bg-slate-100 cursor-pointer"
                  onClick={() => allImgs.length > 0 && (setGalleryImages(allImgs), setGalleryTitle(room.title), setGalleryIndex(0))}
                >
                  {coverImg ? (
                    <img src={coverImg} alt={room.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Building size={32} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                  <span className={`absolute top-2.5 left-2.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}>
                    {STATUS_LABELS[room.status] || room.status}
                  </span>
                  {allImgs.length > 1 && (
                    <span className="absolute bottom-2.5 right-2.5 text-[10px] font-medium text-white bg-black/50 backdrop-blur px-1.5 py-0.5 rounded-full">
                      {allImgs.length} photos
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{room.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {parentProperty ? parentProperty.title : (room.meta?.roomType || "Unit")}
                        {room.code && ` · ${room.code}`}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-slate-900 shrink-0">
                      KES {Number(room.basePrice).toLocaleString()}
                    </span>
                  </div>

                  {Array.isArray(room.meta?.amenities) && room.meta.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {room.meta.amenities.slice(0, 4).map((a: string, i: number) => (
                        <span key={i} className="text-[10px] bg-slate-50 border border-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{a}</span>
                      ))}
                      {room.meta.amenities.length > 4 && (
                        <span className="text-[10px] text-slate-400">+{room.meta.amenities.length - 4} more</span>
                      )}
                    </div>
                  )}

                  {/* Status switcher */}
                  <div className="mt-3 flex gap-1 flex-wrap">
                    {["AVAILABLE", "OCCUPIED", "CLEANING", "MAINTENANCE"].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(room.id, st)}
                        disabled={room.status === st}
                        className={`text-[10px] font-medium px-2 py-1 rounded-full transition-colors ${
                          room.status === st
                            ? "bg-slate-900 text-white cursor-default"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {STATUS_LABELS[st]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-slate-50 flex items-center justify-between">
                  <button onClick={() => openEditUnitModal(room)} className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors">
                    <Edit2 size={12} /> Edit
                  </button>
                  <button onClick={() => handleDeleteResource(room.id, room.title)} className="text-xs font-medium text-slate-400 hover:text-red-600 flex items-center gap-1 transition-colors">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Group Modal */}
      <Modal isOpen={showPropertyModal} onClose={() => setShowPropertyModal(false)} title="Add group" maxWidth="sm">
        <form onSubmit={handleCreateProperty} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">Name *</label>
            <input required type="text" placeholder="e.g. Block A"
              value={propName} onChange={(e) => setPropName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">Address (optional)</label>
            <input type="text" placeholder="e.g. Kilimani, Nairobi"
              value={propAddress} onChange={(e) => setPropAddress(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full bg-slate-900 text-white py-3 rounded-full text-sm font-semibold hover:bg-slate-700 disabled:opacity-40 flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="animate-spin" size={16} /> : "Save group"}
          </button>
        </form>
      </Modal>

      {/* Add / Edit Unit Modal */}
      <Modal
        isOpen={showRoomModal}
        onClose={() => setShowRoomModal(false)}
        closeOnOverlayClick={false}
        title={editingResource ? `Edit: ${editingResource.title}` : "Add unit"}
        maxWidth="xl"
      >
        <form onSubmit={handleSaveRoom} className="space-y-4">
          {/* Title & Code */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Name *</label>
              <input required type="text" placeholder="e.g. Toyota Axio, Deluxe Room 101"
                value={roomTitle} onChange={(e) => setRoomTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Code</label>
              <input type="text" placeholder="e.g. KCG-123X, RM-101"
                value={roomCode} onChange={(e) => setRoomCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
            </div>
          </div>

          {/* Group & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Group (optional)</label>
              <select value={roomParentId} onChange={(e) => setRoomParentId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400">
                <option value="">No group (standalone)</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Category</label>
              <select value={roomType} onChange={(e) => setRoomType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400">
                <option value="Standard">Standard</option>
                <option value="Vehicle">Vehicle</option>
                <option value="Executive">Executive</option>
                <option value="Suite">Suite</option>
                <option value="Commercial">Commercial</option>
                <option value="Budget">Budget</option>
              </select>
            </div>
          </div>

          {/* Rate & Amenities */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Rate (KES) *</label>
              <input required type="number" min="0" step="100" placeholder="e.g. 3500"
                value={roomPrice} onChange={(e) => setRoomPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Amenities</label>
              <input type="text" placeholder="WiFi, AC, Parking"
                value={roomAmenities} onChange={(e) => setRoomAmenities(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">Description</label>
            <textarea rows={2} placeholder="Optional notes..."
              value={roomDescription} onChange={(e) => setRoomDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400 resize-none" />
          </div>

          {/* Photos */}
          <div className="space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">Photos</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50 transition-colors">
                  <UploadCloud size={12} /> Upload
                </button>
                <button type="button" onClick={() => setIsCameraOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50 transition-colors">
                  <Camera size={12} /> Camera
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
              </div>
            </div>

            {/* Dropzone */}
            <div onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl p-5 text-center cursor-pointer transition-colors">
              <UploadCloud size={22} className="mx-auto text-slate-300 mb-1" />
              <p className="text-xs text-slate-500">Click to upload photos</p>
            </div>

            {/* Thumbnails */}
            {roomPhotos.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {roomPhotos.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group bg-slate-900">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <div className="absolute top-1 left-1 bg-slate-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">Cover</div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                      {idx !== 0 && (
                        <button type="button" onClick={() => setPrimaryPhoto(idx)}
                          className="px-1.5 py-1 bg-slate-700 text-white text-[9px] font-bold rounded-lg flex items-center gap-1">
                          <Star size={9} /> Cover
                        </button>
                      )}
                      <button type="button" onClick={() => removePhoto(idx)}
                        className="px-1.5 py-1 bg-red-600 text-white text-[9px] font-bold rounded-lg">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* URL input */}
            <div>
              <p className="text-xs text-slate-400 mb-1.5">Or paste an image URL</p>
              <div className="flex gap-2">
                <input type="url" placeholder="https://..." value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-slate-400" />
                <button type="button" onClick={handleAddCustomUrl}
                  className="text-xs font-medium text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50">
                  Add
                </button>
              </div>
            </div>

            {/* Stock presets */}
            <div>
              <p className="text-xs text-slate-400 mb-1.5">Sample photos:</p>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_PHOTOS.map((p) => (
                  <button key={p.name} type="button"
                    onClick={() => { if (!roomPhotos.includes(p.url)) { setRoomPhotos(prev => [...prev, p.url]); toast.success(`Added ${p.name}`); } }}
                    className="text-[10px] font-medium text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-full hover:bg-slate-50 transition-colors">
                    + {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full bg-slate-900 text-white py-3 rounded-full text-sm font-semibold hover:bg-slate-700 disabled:opacity-40 flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="animate-spin" size={16} /> : (editingResource ? "Save changes" : "Add unit")}
          </button>
        </form>
      </Modal>

      {/* Camera */}
      {isCameraOpen && <CameraCapture onCapture={handleCameraCapture} onClose={() => setIsCameraOpen(false)} />}

      {/* Gallery Lightbox */}
      <AnimatePresence>
        {galleryImages && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl"
            >
              <div className="flex items-center justify-between text-white mb-3 px-1">
                <div>
                  <p className="font-semibold">{galleryTitle}</p>
                  <p className="text-xs text-slate-400">{galleryIndex + 1} / {galleryImages.length}</p>
                </div>
                <button onClick={() => setGalleryImages(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full">
                  <X size={18} />
                </button>
              </div>

              <div className="relative">
                <img src={galleryImages[galleryIndex]} alt="Unit photo" className="max-h-[65vh] w-full object-contain rounded-2xl" />
                {galleryImages.length > 1 && (
                  <>
                    <button onClick={() => setGalleryIndex(p => (p === 0 ? galleryImages.length - 1 : p - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => setGalleryIndex(p => (p === galleryImages.length - 1 ? 0 : p + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full">
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {galleryImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto mt-3 px-1">
                  {galleryImages.map((img, idx) => (
                    <button key={idx} onClick={() => setGalleryIndex(idx)}
                      className={`h-14 w-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        idx === galleryIndex ? "border-white" : "border-transparent opacity-50 hover:opacity-80"
                      }`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
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
