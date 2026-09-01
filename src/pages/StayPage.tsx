import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  MapPin, Star, Wifi, CheckCircle2, Phone, ChevronLeft, ChevronRight,
  BedDouble, Car, Building2, Sparkles, ExternalLink, Coffee, Shield,
  Calendar, BadgeCheck, AlertTriangle, ShoppingBag, Plus, Minus, Trash2,
  X, Send, Check, MessageSquare, Tag, Package
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

interface Room {
  id: string;
  title: string;
  type: string;
  code?: string;
  parentId?: string;
  basePrice: number;
  status: string;
  meta: {
    roomType?: string;
    amenities?: string[];
    description?: string;
    imageUrl?: string;
    images?: string[];
  };
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stockLevel: number;
  imageUrl?: string;
  description?: string;
  type?: string;
}

interface Property {
  id: string;
  title: string;
  meta: { address?: string };
}

interface Listing {
  businessName: string;
  category?: string;
  location?: string;
  phone?: string;
  slug: string;
  businessType?: string;
  properties: Property[];
  rooms: Room[];
  products: Product[];
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: "ROOM" | "PRODUCT";
  imageUrl?: string;
}

interface GalleryState {
  images: string[];
  title: string;
}

function AmenityIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  if (n.includes("wifi") || n.includes("internet")) return <Wifi size={11} />;
  if (n.includes("coffee") || n.includes("breakfast")) return <Coffee size={11} />;
  if (n.includes("park") || n.includes("car")) return <Car size={11} />;
  if (n.includes("security") || n.includes("guard")) return <Shield size={11} />;
  return <CheckCircle2 size={11} />;
}

function GalleryModal({ images, title, onClose }: { images: string[]; title: string; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <img
            src={images[idx]}
            alt={`${title} - photo ${idx + 1}`}
            className="w-full max-h-[70vh] sm:max-h-[75vh] object-contain rounded-2xl"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={() => setIdx(i => (i - 1 + images.length) % images.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-white/20 text-white rounded-full p-2 sm:p-3 transition-all"
                aria-label="Previous photo"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setIdx(i => (i + 1) % images.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-white/20 text-white rounded-full p-2 sm:p-3 transition-all"
                aria-label="Next photo"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
        <p className="text-center text-white/60 text-xs font-bold mt-3">{title} — {idx + 1} / {images.length}</p>
        {images.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Go to photo ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-emerald-400" : "w-1.5 bg-white/30"}`}
              />
            ))}
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/60 hover:text-white text-xs font-bold uppercase tracking-widest"
        >
          Close ✕
        </button>
      </div>
    </motion.div>
  );
}

export default function StayPage({ isShopMode }: { isShopMode?: boolean }) {
  const { slug } = useParams<{ slug: string }>();
  const isShopPath = isShopMode || (typeof window !== 'undefined' && window.location.pathname.startsWith('/shop'));
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"rooms" | "products">(isShopPath ? "products" : "rooms");
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Cart & Order State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  // Gallery State
  const [gallery, setGallery] = useState<GalleryState | null>(null);

  // Form Fields
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    const endpoint = isShopPath ? `${API_URL}/api/v1/public/shop/${slug}` : `${API_URL}/api/v1/public/stay/${slug}`;
    axios.get(endpoint)
      .then(res => {
        const data = res.data.data;
        setListing(data);
        if (isShopPath || (!data.rooms || data.rooms.length === 0)) {
          if (data.products && data.products.length > 0) {
            setActiveTab("products");
          }
        }
      })
      .catch(err => setError(err.response?.data?.message || "Listing not found"))
      .finally(() => setLoading(false));
  }, [slug, isShopPath]);

  const addToCart = (item: { id: string; name: string; price: number; type: "ROOM" | "PRODUCT"; imageUrl?: string }) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`Added "${item.name}" to cart`);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : i;
      }
      return i;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const totalCartAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      return toast.error("Please enter your name and phone number");
    }
    if (cart.length === 0) {
      return toast.error("Your cart is empty");
    }

    setSubmittingOrder(true);
    try {
      const res = await axios.post(`${API_URL}/api/v1/public/order`, {
        slug,
        customerName,
        customerPhone,
        deliveryAddress,
        notes,
        items: cart,
      });

      // Save name for success screen, then clear everything
      const orderedByName = customerName;
      setOrderSuccess({ ...res.data.data, orderedByName });
      // Clear cart and all form fields so next order starts fresh
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setDeliveryAddress("");
      setNotes("");
      setIsOrdering(false);
      setIsCartOpen(false);
      toast.success("Order submitted successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit order. Please try again.");
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030A07] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm font-bold">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-[#030A07] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" />
          <h1 className="text-white text-xl font-black mb-2">Listing Not Found</h1>
          <p className="text-slate-400 text-sm font-medium">{error || "This store or listing does not exist."}</p>
          <a href="/" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all">
            ← Back to Hlynk
          </a>
        </div>
      </div>
    );
  }

  const allRooms = listing.rooms || [];
  const allProducts = listing.products || [];
  const roomTypes = [...new Set(allRooms.map(r => r.type))];
  const productCategories = [...new Set(allProducts.map(p => p.category || "General"))];

  const filteredRooms = filter === "all" ? allRooms : allRooms.filter(r => r.type === filter);
  const filteredProducts = categoryFilter === "all" ? allProducts : allProducts.filter(p => (p.category || "General") === categoryFilter);

  const cartItemCount = cart.reduce((a, c) => a + c.quantity, 0);

  return (
    <div className="min-h-screen bg-[#030A07] text-white pb-28 sm:pb-24">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/50 via-[#030A07] to-slate-950 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-800/10 blur-[120px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-5 pt-6 sm:pt-12 pb-8">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-6 sm:mb-8">
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-emerald-500 hover:text-slate-950 text-white font-bold text-xs transition-all active:scale-95 border border-white/10"
                title="Go Back"
              >
                <ChevronLeft size={16} /> <span className="hidden xs:inline">Back</span>
              </button>
              <button
                onClick={() => window.history.forward()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-emerald-500 hover:text-slate-950 text-white font-bold text-xs transition-all active:scale-95 border border-white/10"
                title="Go Forward"
              >
                <span className="hidden xs:inline">Next</span> <ChevronRight size={16} />
              </button>
              <a href="/" className="hidden md:flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors group ml-2">
                <Sparkles size={14} className="group-hover:animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Powered by Hlynk</span>
              </a>
            </div>

            {/* Cart Button */}
            {cart.length > 0 && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-1.5 sm:gap-2 bg-emerald-500 text-slate-950 pl-3 pr-2 sm:px-4 py-2 rounded-full font-black text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all"
              >
                <ShoppingBag size={15} className="shrink-0" />
                <span className="whitespace-nowrap">Order ({cartItemCount})</span>
                <span className="bg-slate-950 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap">
                  KES {totalCartAmount.toLocaleString()}
                </span>
              </button>
            )}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex items-center gap-2">
              <BadgeCheck size={18} className="text-emerald-400 shrink-0" />
              <span className="text-[10px] font-black text-emerald-400 uppercas`e tracking-[0.2em]">Verified Business</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight break-words">
              {listing.businessName}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400 font-medium">
              {listing.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-emerald-500 shrink-0" />
                  {listing.location}
                </span>
              )}
              {listing.category && (
                <span className="flex items-center gap-1.5">
                  <Star size={14} className="text-amber-400 shrink-0" />
                  {listing.category}
                </span>
              )}
              {listing.phone && (
                <a href={`tel:${listing.phone}`} className="flex items-center gap-1.5 text-emerald-400 hover:underline">
                  <Phone size={14} className="shrink-0" />
                  {listing.phone}
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Tabs (if business has both rooms and products) */}
      {allRooms.length > 0 && allProducts.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 sm:px-5 mb-6">
          <div className="flex bg-white/5 border border-white/10 p-1 rounded-2xl w-full max-w-md">
            <button
              onClick={() => setActiveTab("rooms")}
              className={`flex-1 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                activeTab === "rooms" ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <BedDouble size={14} className="shrink-0" /> <span className="truncate">Rooms & Spaces ({allRooms.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`flex-1 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                activeTab === "products" ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <Package size={14} className="shrink-0" /> <span className="truncate">Products & Shop ({allProducts.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION: ROOMS / SPACES */}
      {activeTab === "rooms" && allRooms.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 sm:px-5 space-y-6">
          {roomTypes.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === "all" ? "bg-emerald-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                All ({allRooms.length})
              </button>
              {roomTypes.map(t => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === t ? "bg-emerald-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  {t} ({allRooms.filter(r => r.type === t).length})
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredRooms.map(room => {
              const imgList = room.meta.images && room.meta.images.length > 0
                ? room.meta.images
                : (room.meta.imageUrl ? [room.meta.imageUrl] : []);
              const img = imgList[0];
              return (
                <div key={room.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col justify-between">
                  <button
                    type="button"
                    onClick={() => img && setGallery({ images: imgList, title: room.title })}
                    disabled={!img}
                    className="relative h-44 sm:h-48 bg-slate-900 overflow-hidden w-full text-left disabled:cursor-default"
                  >
                    {img ? (
                      <img src={img} alt={room.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800/50">
                        <BedDouble size={36} className="text-slate-600" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-emerald-500 text-slate-950 font-black text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full">
                      Available
                    </div>
                    {imgList.length > 1 && (
                      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white font-bold text-[9px] px-2 py-1 rounded-full">
                        +{imgList.length - 1} photos
                      </div>
                    )}
                  </button>

                  <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-black text-base sm:text-lg text-white">{room.title}</h3>
                      {room.meta.description && <p className="text-xs text-slate-400 line-clamp-2 mt-1">{room.meta.description}</p>}
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold text-slate-500 uppercase block">Rate</span>
                        <span className="text-base sm:text-lg font-black text-emerald-400 truncate block">KES {Number(room.basePrice).toLocaleString()}</span>
                      </div>

                      <button
                        onClick={() => addToCart({ id: room.id, name: room.title, price: Number(room.basePrice), type: "ROOM", imageUrl: img })}
                        className="shrink-0 px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[11px] sm:text-xs rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap"
                      >
                        <Plus size={14} /> Book
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION: PRODUCTS / SHOP */}
      {(activeTab === "products" || allRooms.length === 0) && allProducts.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 sm:px-5 space-y-6">
          {productCategories.length > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const el = document.getElementById("category-scroll-container");
                  if (el) el.scrollBy({ left: -150, behavior: "smooth" });
                }}
                className="hidden sm:flex p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 transition-all shrink-0"
                title="Scroll Left"
              >
                <ChevronLeft size={14} />
              </button>
              <div id="category-scroll-container" className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 flex-1 -mx-4 px-4 sm:mx-0 sm:px-0">
                <button
                  onClick={() => setCategoryFilter("all")}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    categoryFilter === "all" ? "bg-emerald-600 text-white shadow" : "bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  All ({allProducts.length})
                </button>
                {productCategories.map(c => (
                  <button
                    key={c}
                    onClick={() => setCategoryFilter(c)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      categoryFilter === c ? "bg-emerald-600 text-white shadow" : "bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    {c} ({allProducts.filter(p => (p.category || "General") === c).length})
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  const el = document.getElementById("category-scroll-container");
                  if (el) el.scrollBy({ left: 150, behavior: "smooth" });
                }}
                className="hidden sm:flex p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 transition-all shrink-0"
                title="Scroll Right"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredProducts.map(prod => (
              <div key={prod.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col justify-between">
                <button
                  type="button"
                  onClick={() => prod.imageUrl && setGallery({ images: [prod.imageUrl], title: prod.name })}
                  disabled={!prod.imageUrl}
                  className="relative h-40 sm:h-44 bg-slate-900 overflow-hidden w-full text-left disabled:cursor-default"
                >
                  {prod.imageUrl ? (
                    <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800/50">
                      <Package size={36} className="text-slate-600" />
                    </div>
                  )}
                  {prod.category && (
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full">
                      {prod.category}
                    </div>
                  )}
                </button>

                <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-black text-sm sm:text-base text-white">{prod.name}</h3>
                    {prod.description && <p className="text-xs text-slate-400 line-clamp-2 mt-1">{prod.description}</p>}
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-slate-500 uppercase block">Price</span>
                      <span className="text-base sm:text-lg font-black text-emerald-400 truncate block">KES {Number(prod.price).toLocaleString()}</span>
                    </div>

                    <button
                      onClick={() => addToCart({ id: prod.id, name: prod.name, price: Number(prod.price), type: "PRODUCT", imageUrl: prod.imageUrl })}
                      className="shrink-0 px-3.5 sm:px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] sm:text-xs rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap"
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EMPTY CATALOG FALLBACK */}
      {allRooms.length === 0 && allProducts.length === 0 && (
        <div className="max-w-md mx-auto my-12 mx-4 sm:mx-auto p-6 sm:p-8 bg-white/5 border border-white/10 rounded-3xl text-center space-y-3">
          <Package size={48} className="mx-auto text-emerald-400 opacity-60 mb-2" />
          <h3 className="text-lg font-black text-white">Catalog Coming Soon</h3>
          <p className="text-xs text-slate-400">
            This business has not published any items or services yet. Please check back shortly or call them directly.
          </p>
          {listing.phone && (
            <a
              href={`tel:${listing.phone}`}
              className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all"
            >
              <Phone size={14} /> Call Business
            </a>
          )}
        </div>
      )}

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && !isCartOpen && (
        <div className="fixed bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-40 max-w-xl mx-auto pb-[env(safe-area-inset-bottom)]">
          <div className="bg-emerald-500 text-slate-950 p-3 sm:p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="bg-slate-950 text-emerald-400 h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                {cartItemCount}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider truncate">Total Selected</p>
                <p className="text-base sm:text-lg font-black leading-none truncate">KES {totalCartAmount.toLocaleString()}</p>
              </div>
            </div>

            <button
              onClick={() => { setIsCartOpen(true); setIsOrdering(true); }}
              className="shrink-0 bg-slate-950 hover:bg-slate-900 text-white font-black text-[11px] sm:text-xs uppercase tracking-widest px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl flex items-center gap-1.5 sm:gap-2 transition-all"
            >
              Order Now <Send size={13} />
            </button>
          </div>
        </div>
      )}

      {/* CART & CHECKOUT MODAL */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }}
              className="bg-[#0A1410] border border-white/10 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 space-y-5 sm:space-y-6 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto text-white"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4 sticky -top-5 sm:-top-6 bg-[#0A1410] pt-1 -mx-5 sm:-mx-6 px-5 sm:px-6 z-10">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="text-emerald-400" size={20} />
                  <h2 className="font-black text-lg">Your Order</h2>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-white p-1">
                  <X size={20} />
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-40 sm:max-h-48 overflow-y-auto pr-1">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between gap-2 bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="min-w-0">
                      <p className="font-bold text-xs truncate">{item.name}</p>
                      <p className="text-[10px] text-emerald-400 font-black">KES {item.price.toLocaleString()} each</p>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20">
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20">
                        <Plus size={12} />
                      </button>
                      <button onClick={() => removeFromCart(item.id)} className="p-1.5 text-red-400 hover:text-red-300 ml-1">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleOrderSubmit} className="space-y-3 pt-3 border-t border-white/10">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Your Full Name *</label>
                  <input
                    type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Your Phone Number *</label>
                  <input
                    type="tel" required value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 0712 345 678"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Delivery Address / Room # / Location</label>
                  <input
                    type="text" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)}
                    placeholder="e.g. Room 204 or Westlands Nairobi"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Special Instructions / Notes</label>
                  <textarea
                    rows={2} value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Any specific requests?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Due</span>
                    <span className="text-xl font-black text-emerald-400">KES {totalCartAmount.toLocaleString()}</span>
                  </div>

                  <button
                    type="submit" disabled={submittingOrder}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {submittingOrder ? "Submitting..." : "Confirm Order"} <Check size={14} />
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ORDER SUCCESS MODAL */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="bg-[#0A1410] border border-emerald-500/30 p-5 sm:p-6 rounded-3xl max-w-md w-full text-center space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="h-14 w-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-black text-white">Order Received!</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Thank you, <span className="font-bold text-emerald-400">{orderSuccess.orderedByName}</span>! Your order has been placed with <span className="font-bold">{listing.businessName}</span>. They will reach out to confirm shortly.
              </p>
              <div className="bg-emerald-900/30 border border-emerald-500/20 p-3 rounded-2xl text-xs text-emerald-300">
                <Tag size={12} className="inline mr-1.5 opacity-70" />Your order has been saved. The business will contact you on the phone number you provided.
              </div>
              <div className="pt-2 flex flex-col gap-2">
                {listing.phone && (
                  <a
                    href={`https://wa.me/${listing.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${listing.businessName}, I just placed an order on your online store. My name is ${orderSuccess.orderedByName}.`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={16} /> Chat on WhatsApp
                  </a>
                )}
                <button
                  onClick={() => setOrderSuccess(null)}
                  className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-slate-300 font-medium text-sm rounded-xl"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PHOTO GALLERY MODAL */}
      <AnimatePresence>
        {gallery && (
          <GalleryModal images={gallery.images} title={gallery.title} onClose={() => setGallery(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}