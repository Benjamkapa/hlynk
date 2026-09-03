import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  BedDouble,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  MapPin,
  MessageCircle,
  Minus,
  Package,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  X,
  AlertTriangle,
  Lock,
  SlidersHorizontal,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const FONT_LINK_ID = "hlynk-store-fonts";

function useStoreFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;

    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&display=swap";
    document.head.appendChild(link);
  }, []);
}

const serif = { fontFamily: "'Playfair Display', Georgia, serif" };

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

type ViewMode = "grid" | "list";

function formatPrice(price: number) {
  return `KES ${Number(price || 0).toLocaleString()}`;
}

function getItemImage(item: Room | Product): string | undefined {
  if ("meta" in item) {
    return item.meta?.imageUrl || item.meta?.images?.[0];
  }
  return item.imageUrl;
}

function getItemImages(item: Room | Product): string[] {
  if ("meta" in item) {
    if (item.meta?.images?.length) return item.meta.images.filter(Boolean);
    if (item.meta?.imageUrl) return [item.meta.imageUrl];
    return [];
  }
  return item.imageUrl ? [item.imageUrl] : [];
}

function GalleryModal({
  images,
  title,
  onClose,
}: {
  images: string[];
  title: string;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [images]);

  if (!images.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-5xl"
      >
        <img
          src={images[index]}
          alt={`${title} ${index + 1}`}
          className="max-h-[78vh] w-full rounded-[28px] object-contain"
        />

        <div className="mt-3 flex items-center justify-between px-1 text-sm text-white/70">
          <span className="truncate">{title}</span>
          <span>{index + 1} / {images.length}</span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute -top-3 -right-2 grid h-10 w-10 place-items-center rounded-full bg-white text-slate-900 shadow-lg"
          aria-label="Close gallery"
        >
          <X size={18} />
        </button>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIndex((value) => (value - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60"
              aria-label="Previous image"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              onClick={() => setIndex((value) => (value + 1) % images.length)}
              className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60"
              aria-label="Next image"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
        <Search size={24} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">Nothing found</h3>
      <p className="mt-1 text-sm text-slate-500">
        {query ? `No results match "${query}". Try another search.` : "There are no items in this category yet."}
      </p>
    </div>
  );
}

function CatalogCard({
  item,
  image,
  imageCount,
  onImageClick,
  onAdd,
  ctaLabel,
  isList,
}: {
  item: Room | Product;
  image?: string;
  imageCount: number;
  onImageClick: () => void;
  onAdd: () => void;
  ctaLabel: string;
  isList: boolean;
}) {
  const title = "title" in item ? item.title : item.name;
  const category = "title" in item ? item.type : item.category || "General";
  const description =
    "title" in item ? item.meta?.description : item.description;
  const price = "title" in item ? Number(item.basePrice) : Number(item.price);

  const fallback = "title" in item ? <BedDouble size={30} /> : <Package size={30} />;

  return (
    <article
      className={`group overflow-hidden rounded-[24px] border border-slate-200 bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)] ${
        isList ? "flex min-h-[180px]" : "flex flex-col"
      }`}
    >
      <button
        type="button"
        disabled={!image}
        onClick={onImageClick}
        className={`relative overflow-hidden bg-[#f3f1ec] text-left disabled:cursor-default ${
          isList ? "w-[42%] min-w-[145px] sm:w-[220px]" : "aspect-[1/1.05] w-full"
        }`}
      >
        {image ? (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
          />
        ) : (
          <div className="grid h-full min-h-[180px] place-items-center text-slate-400">
            {fallback}
          </div>
        )}

        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700 shadow-sm backdrop-blur">
          {category}
        </span>

        {imageCount > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-slate-950/65 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur">
            +{imageCount - 1} photos
          </span>
        )}
      </button>

      <div className={`flex flex-1 flex-col ${isList ? "p-5" : "p-4 sm:p-5"}`}>
        <div>
          <h3 className={`font-semibold tracking-tight text-slate-950 ${isList ? "text-lg" : "text-base"}`}>
            {title}
          </h3>

          {description && (
            <p className={`mt-2 text-sm leading-6 text-slate-500 ${isList ? "line-clamp-2" : "line-clamp-2"}`}>
              {description}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {ctaLabel === "Book" ? "From" : "Price"}
            </p>
            <p className="mt-1 text-base font-bold tracking-tight text-slate-950">
              {formatPrice(price)}
            </p>
          </div>

          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 active:scale-95"
          >
            <Plus size={14} />
            {ctaLabel}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function StayPage({ isShopMode }: { isShopMode?: boolean }) {
  useStoreFonts();

  const { slug } = useParams<{ slug: string }>();
  const isShopPath =
    isShopMode ||
    (typeof window !== "undefined" &&
      window.location.pathname.startsWith("/shop"));

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"rooms" | "products">(
    isShopPath ? "products" : "rooms"
  );
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  const [gallery, setGallery] = useState<GalleryState | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    const endpoint = isShopPath
      ? `${API_URL}/api/v1/public/shop/${slug}`
      : `${API_URL}/api/v1/public/stay/${slug}`;

    axios
      .get(endpoint)
      .then((response) => {
        const data = response.data.data;
        setListing(data);

        if (
          (isShopPath || !data.rooms || data.rooms.length === 0) &&
          data.products?.length
        ) {
          setActiveTab("products");
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Listing not found");
      })
      .finally(() => setLoading(false));
  }, [slug, isShopPath]);

  const switchTab = (tab: "rooms" | "products") => {
    setActiveTab(tab);
    setSearchQuery("");
    setFilter("all");
    setCategoryFilter("all");
  };

  const addToCart = (item: {
    id: string;
    name: string;
    price: number;
    type: "ROOM" | "PRODUCT";
    imageUrl?: string;
  }) => {
    setCart((current) => {
      const existing = current.find((entry) => entry.id === item.id);

      if (existing) {
        return current.map((entry) =>
          entry.id === item.id
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry
        );
      }

      return [...current, { ...item, quantity: 1 }];
    });

    toast.success(`${item.name} added to cart`);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const totalCartAmount = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [cart]
  );

  const cartItemCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart]
  );

  const handleOrderSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error("Please enter your name and phone number");
      return;
    }

    if (!cart.length) {
      toast.error("Your cart is empty");
      return;
    }

    setSubmittingOrder(true);

    try {
      const response = await axios.post(`${API_URL}/api/v1/public/order`, {
        slug,
        customerName,
        customerPhone,
        deliveryAddress,
        notes,
        items: cart,
      });

      setOrderSuccess({
        ...response.data.data,
        orderedByName: customerName,
      });

      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setDeliveryAddress("");
      setNotes("");
      setIsOrdering(false);
      setIsCartOpen(false);

      toast.success("Order submitted successfully");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Failed to submit order. Please try again."
      );
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f6f6f4]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-900 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading store...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    const isLockedError =
      error?.toLowerCase().includes("business pro") ||
      error?.toLowerCase().includes("trial");

    return (
      <div className="grid min-h-screen place-items-center bg-[#f6f6f4] p-5">
        <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-600">
            {isLockedError ? <Lock size={25} /> : <AlertTriangle size={25} />}
          </div>

          <h1 className="mt-5 text-2xl text-slate-950" style={serif}>
            {isLockedError
              ? "Business Pro subscription required"
              : "Store unavailable"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error || "This store or listing does not exist."}
          </p>

          <div className="mt-6 grid gap-2">
            {isLockedError && (
              <a
                href="/login"
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                Log in & upgrade
              </a>
            )}

            <a
              href="/"
              className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
            >
              Back to Hlynk
            </a>
          </div>
        </div>
      </div>
    );
  }

  const allRooms = listing.rooms || [];
  const allProducts = listing.products || [];

  const roomTypes = [...new Set(allRooms.map((room) => room.type).filter(Boolean))];
  const productCategories = [
    ...new Set(
      allProducts.map((product) => product.category || "General").filter(Boolean)
    ),
  ];

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredRooms = allRooms
    .filter((room) => filter === "all" || room.type === filter)
    .filter(
      (room) =>
        !normalizedQuery ||
        room.title.toLowerCase().includes(normalizedQuery) ||
        room.type.toLowerCase().includes(normalizedQuery)
    );

  const filteredProducts = allProducts
    .filter(
      (product) =>
        categoryFilter === "all" ||
        (product.category || "General") === categoryFilter
    )
    .filter(
      (product) =>
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        (product.category || "").toLowerCase().includes(normalizedQuery)
    );

  const activeItems =
    activeTab === "rooms" && allRooms.length ? allRooms : allProducts;

  const allImages = [
    ...allRooms.flatMap((room) => getItemImages(room)),
    ...allProducts.flatMap((product) => getItemImages(product)),
  ].filter(Boolean);

  const uniqueImages = [...new Set(allImages)];
  const heroImage =
    uniqueImages[0] ||
    allProducts.find((product) => product.imageUrl)?.imageUrl ||
    allRooms.find((room) => room.meta?.imageUrl)?.meta?.imageUrl;

  const mosaicImages = uniqueImages.slice(1, 4);
  const featuredItems = activeItems.slice(0, 4);

  const activeCategories =
    activeTab === "rooms" ? roomTypes : productCategories;

  const setActiveCategory = (value: string) => {
    if (activeTab === "rooms") setFilter(value);
    else setCategoryFilter(value);
  };

  const currentFilter =
    activeTab === "rooms" ? filter : categoryFilter;

  const sectionTitle =
    activeTab === "rooms" ? "Stay your way" : "Popular picks";

  const sectionSubtitle =
    activeTab === "rooms"
      ? "Choose the space that fits your visit."
      : "Explore what is available in store.";

  return (
    <div
      className="min-h-screen bg-[#f7f7f5] pb-28 text-slate-900"
      style={{ fontFamily: "'DM Sans', Inter, sans-serif" }}
    >
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#f7f7f5]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>

            <a
              href="/"
              className="truncate text-lg font-semibold tracking-tight text-slate-950 sm:text-xl"
              style={serif}
            >
              {listing.businessName}
            </a>
          </div>

          <nav className="hidden items-center gap-6 text-xs font-medium text-slate-500 md:flex">
            <a href="#catalog" className="transition hover:text-slate-950">Shop</a>
            <a href="#featured" className="transition hover:text-slate-950">Featured</a>
            {listing.phone && (
              <a href="#contact" className="transition hover:text-slate-950">Contact</a>
            )}
          </nav>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative inline-flex h-10 items-center gap-2 rounded-full bg-slate-950 px-3.5 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            <ShoppingBag size={15} />
            <span className="hidden sm:inline">Cart</span>
            {cartItemCount > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[10px] font-bold text-slate-950">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        {/* HERO: large content-led composition instead of a generic full-screen banner */}
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.85fr)_minmax(330px,0.85fr)]">
          <div className="relative min-h-[460px] overflow-hidden rounded-[30px] bg-slate-950 sm:min-h-[540px]">
            {heroImage ? (
              <img
                src={heroImage}
                alt={listing.businessName}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#5b6b5e,_#24352d_45%,_#111827)]" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-slate-950/5" />

            <div className="relative flex h-full min-h-[460px] flex-col justify-between p-5 sm:min-h-[540px] sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
                  <Sparkles size={13} className="text-amber-300" />
                  Online store
                </span>

                {listing.location && (
                  <span className="hidden items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] text-white/85 backdrop-blur sm:flex">
                    <MapPin size={13} />
                    {listing.location}
                  </span>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="max-w-2xl"
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
                  {listing.category || listing.businessType || "Discover more"}
                </p>

                <h1
                  className="max-w-xl text-4xl leading-[1.02] text-white sm:text-6xl lg:text-7xl"
                  style={serif}
                >
                  {listing.businessName}
                  <span className="block italic text-white/80">
                    made simple.
                  </span>
                </h1>

                <p className="mt-5 max-w-lg text-sm leading-7 text-white/75 sm:text-base">
                  Browse the collection, discover what is available and place
                  your order directly with the business.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  {activeItems.length > 0 && (
                    <a
                      href="#catalog"
                      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold text-slate-950 transition hover:bg-slate-100"
                    >
                      {activeTab === "rooms" ? "Explore spaces" : "Shop collection"}
                      <ChevronRight size={15} />
                    </a>
                  )}

                  {listing.phone && (
                    <a
                      href={`tel:${listing.phone}`}
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/20"
                    >
                      <Phone size={14} />
                      Contact
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right-hand merchandising rail */}
          <div className="grid min-h-[460px] gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="relative min-h-[220px] overflow-hidden rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Featured collection
                  </p>
                  <h2 className="mt-2 max-w-[220px] text-2xl leading-tight text-slate-950" style={serif}>
                    Find something worth coming back for.
                  </h2>
                </div>

                <a
                  href="#featured"
                  className="inline-flex w-fit items-center gap-1.5 text-xs font-bold text-slate-950"
                >
                  Explore featured <ChevronRight size={15} />
                </a>
              </div>

              {mosaicImages[0] && (
                <img
                  src={mosaicImages[0]}
                  alt=""
                  className="absolute bottom-0 right-0 h-[62%] w-[58%] rounded-tl-[26px] object-cover"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {mosaicImages.slice(1, 3).map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() =>
                    setGallery({
                      images: uniqueImages,
                      title: listing.businessName,
                    })
                  }
                  className="group relative min-h-[220px] overflow-hidden rounded-[28px] bg-slate-200"
                >
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  <span className="absolute bottom-4 left-4 text-left text-xs font-semibold text-white">
                    {index === 0 ? "Discover" : "New arrivals"}
                  </span>
                </button>
              ))}

              {!mosaicImages[1] && !mosaicImages[2] && (
                <div className="col-span-2 grid min-h-[220px] place-items-center rounded-[28px] bg-slate-900 p-6 text-center text-white">
                  <div>
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
                      <Package size={21} />
                    </div>
                    <p className="mt-3 text-sm font-semibold">Curated by {listing.businessName}</p>
                    <p className="mt-1 text-xs text-white/60">Fresh items and spaces, updated by the business.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* TRUST / STORE INFO STRIP */}
        <section className="mt-4 grid overflow-hidden rounded-[24px] border border-slate-200 bg-white sm:grid-cols-2 lg:grid-cols-4">
          <InfoCell
            icon={<CheckCircle2 size={17} />}
            label="Direct ordering"
            value="Order straight from the business"
          />
          <InfoCell
            icon={<ShoppingBag size={17} />}
            label="Available now"
            value={`${activeItems.length} item${activeItems.length === 1 ? "" : "s"} listed`}
          />
          <InfoCell
            icon={<MapPin size={17} />}
            label="Location"
            value={listing.location || "Contact business for details"}
          />
          <InfoCell
            icon={<Phone size={17} />}
            label="Need help?"
            value={listing.phone || "Use the contact options below"}
          />
        </section>

        {/* FEATURED HORIZONTAL CARDS */}
        {featuredItems.length > 0 && (
          <section id="featured" className="mt-12">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Selected for you
                </p>
                <h2 className="mt-1 text-3xl text-slate-950 sm:text-4xl" style={serif}>
                  A closer look at <span className="italic">what's inside</span>
                </h2>
              </div>

              <a
                href="#catalog"
                className="hidden items-center gap-1 text-xs font-bold text-slate-700 sm:inline-flex"
              >
                View all <ChevronRight size={15} />
              </a>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {featuredItems.map((item) => {
                const image = getItemImage(item);
                const title = "title" in item ? item.title : item.name;
                const price =
                  "title" in item ? Number(item.basePrice) : Number(item.price);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => image && setGallery({ images: getItemImages(item), title })}
                    className="group w-[220px] shrink-0 overflow-hidden rounded-[24px] border border-slate-200 bg-white text-left transition hover:shadow-lg sm:w-[250px]"
                  >
                    <div className="aspect-[1.08/1] overflow-hidden bg-[#efefec]">
                      {image ? (
                        <img
                          src={image}
                          alt={title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-slate-400">
                          <Package size={30} />
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <p className="truncate text-sm font-semibold text-slate-950">{title}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{formatPrice(price)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* CATALOG */}
        <section id="catalog" className="mt-14 scroll-mt-24">
          {allRooms.length > 0 && allProducts.length > 0 && (
            <div className="mb-7 flex items-center gap-2 overflow-x-auto border-b border-slate-200 no-scrollbar">
              <button
                type="button"
                onClick={() => switchTab("rooms")}
                className={`relative px-4 py-3 text-sm font-semibold transition ${
                  activeTab === "rooms"
                    ? "text-slate-950"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <BedDouble size={16} /> Rooms & spaces
                </span>
                {activeTab === "rooms" && (
                  <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-slate-950" />
                )}
              </button>

              <button
                type="button"
                onClick={() => switchTab("products")}
                className={`relative px-4 py-3 text-sm font-semibold transition ${
                  activeTab === "products"
                    ? "text-slate-950"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Package size={16} /> Products
                </span>
                {activeTab === "products" && (
                  <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-slate-950" />
                )}
              </button>
            </div>
          )}

          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                {activeTab === "rooms" ? "Availability" : "Shop the collection"}
              </p>
              <h2 className="mt-1 text-3xl text-slate-950 sm:text-4xl" style={serif}>
                {sectionTitle}
              </h2>
              <p className="mt-2 text-sm text-slate-500">{sectionSubtitle}</p>
            </div>

            <div className="flex w-full items-center gap-2 lg:max-w-[470px]">
              <div className="relative min-w-0 flex-1">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={activeTab === "rooms" ? "Search spaces..." : "Search products..."}
                  className="h-11 w-full rounded-full border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="flex h-11 items-center rounded-full border border-slate-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`grid h-9 w-9 place-items-center rounded-full transition ${
                    viewMode === "grid"
                      ? "bg-slate-950 text-white"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`grid h-9 w-9 place-items-center rounded-full transition ${
                    viewMode === "list"
                      ? "bg-slate-950 text-white"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                  aria-label="List view"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* CATEGORY CHIPS */}
          {activeCategories.length > 1 && (
            <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <div className="inline-flex items-center gap-1.5 pr-1 text-xs font-semibold text-slate-400">
                <SlidersHorizontal size={14} />
                Filter
              </div>

              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  currentFilter === "all"
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                }`}
              >
                All
              </button>

              {activeCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition ${
                    currentFilter === category
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          <div className="mt-7">
            {activeTab === "rooms" && allRooms.length > 0 && (
              filteredRooms.length ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                      : "grid gap-3"
                  }
                >
                  {filteredRooms.map((room) => {
                    const images = getItemImages(room);
                    return (
                      <CatalogCard
                        key={room.id}
                        item={room}
                        image={images[0]}
                        imageCount={images.length}
                        onImageClick={() =>
                          images.length &&
                          setGallery({ images, title: room.title })
                        }
                        onAdd={() =>
                          addToCart({
                            id: room.id,
                            name: room.title,
                            price: Number(room.basePrice),
                            type: "ROOM",
                            imageUrl: images[0],
                          })
                        }
                        ctaLabel="Book"
                        isList={viewMode === "list"}
                      />
                    );
                  })}
                </div>
              ) : (
                <EmptyState query={searchQuery} />
              )
            )}

            {(activeTab === "products" || allRooms.length === 0) &&
              allProducts.length > 0 &&
              (filteredProducts.length ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
                      : "grid gap-3"
                  }
                >
                  {filteredProducts.map((product) => {
                    const images = getItemImages(product);
                    return (
                      <CatalogCard
                        key={product.id}
                        item={product}
                        image={images[0]}
                        imageCount={images.length}
                        onImageClick={() =>
                          images.length &&
                          setGallery({ images, title: product.name })
                        }
                        onAdd={() =>
                          addToCart({
                            id: product.id,
                            name: product.name,
                            price: Number(product.price),
                            type: "PRODUCT",
                            imageUrl: images[0],
                          })
                        }
                        ctaLabel="Add"
                        isList={viewMode === "list"}
                      />
                    );
                  })}
                </div>
              ) : (
                <EmptyState query={searchQuery} />
              ))}

            {!allRooms.length && !allProducts.length && (
              <EmptyState query="" />
            )}
          </div>
        </section>

        {/* BRAND / CONTACT FOOTER */}
        <section
          id="contact"
          className="mt-14 grid overflow-hidden rounded-[30px] bg-slate-950 text-white lg:grid-cols-[1.25fr_0.75fr]"
        >
          <div className="p-7 sm:p-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
              Directly connected
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl leading-tight sm:text-5xl" style={serif}>
              Questions before you order?
              <span className="block italic text-white/65">
                Talk to {listing.businessName}.
              </span>
            </h2>

            <div className="mt-7 flex flex-wrap gap-3">
              {listing.phone && (
                <>
                  <a
                    href={`tel:${listing.phone}`}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold text-slate-950 transition hover:bg-slate-100"
                  >
                    <Phone size={15} />
                    Call business
                  </a>

                  <a
                    href={`https://wa.me/${listing.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-xs font-bold text-white transition hover:bg-white/15"
                  >
                    <MessageCircle size={15} />
                    WhatsApp
                  </a>
                </>
              )}
            </div>
          </div>

          <div className="flex items-end border-t border-white/10 bg-white/[0.035] p-7 sm:p-10 lg:border-l lg:border-t-0">
            <div>
              <div className="flex items-center gap-1 text-amber-300">
                <Star size={15} fill="currentColor" />
                <Star size={15} fill="currentColor" />
                <Star size={15} fill="currentColor" />
                <Star size={15} fill="currentColor" />
                <Star size={15} fill="currentColor" />
              </div>
              <p className="mt-4 text-sm leading-7 text-white/70">
                Browse, select and send your order directly. The business will
                follow up using the contact details you provide.
              </p>
              <p className="mt-5 text-xs font-semibold text-white">
                Powered by Hlynk
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* MOBILE / GLOBAL CART BAR */}
      <AnimatePresence>
        {cart.length > 0 && !isCartOpen && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl"
          >
            <button
              type="button"
              onClick={() => {
                setIsCartOpen(true);
                setIsOrdering(true);
              }}
              className="flex w-full items-center justify-between rounded-[22px] bg-slate-950 p-3 pl-4 text-left text-white shadow-[0_20px_55px_rgba(15,23,42,0.28)]"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-sm font-bold text-slate-950">
                  {cartItemCount}
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.13em] text-white/45">
                    Your cart
                  </span>
                  <span className="block truncate text-sm font-bold">
                    {formatPrice(totalCartAmount)}
                  </span>
                </span>
              </span>

              <span className="rounded-xl bg-white px-4 py-3 text-xs font-bold text-slate-950">
                Checkout
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 z-[80] bg-slate-950/40 backdrop-blur-sm"
          >
            <motion.aside
              initial={{ x: 500 }}
              animate={{ x: 0 }}
              exit={{ x: 500 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              onClick={(event) => event.stopPropagation()}
              className="ml-auto flex h-full w-full max-w-[520px] flex-col bg-[#fafaf9] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-7">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    {isOrdering ? "Checkout" : "Your selection"}
                  </p>
                  <h2 className="mt-1 text-2xl text-slate-950" style={serif}>
                    Your cart
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600"
                  aria-label="Close cart"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
                {!cart.length ? (
                  <div className="grid min-h-[50vh] place-items-center text-center">
                    <div>
                      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                        <ShoppingBag size={24} />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-slate-950">Your cart is empty</h3>
                      <p className="mt-1 text-sm text-slate-500">Add something from the collection to continue.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-3 rounded-[20px] border border-slate-200 bg-white p-3"
                        >
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="grid h-full place-items-center text-slate-400">
                                <Package size={20} />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex flex-1 flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-950">
                                  {item.name}
                                </p>
                                <p className="mt-1 text-xs font-medium text-slate-500">
                                  {formatPrice(item.price)}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeFromCart(item.id)}
                                className="p-1 text-slate-400 transition hover:text-rose-600"
                                aria-label={`Remove ${item.name}`}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <div className="mt-auto flex items-center justify-between">
                              <div className="flex items-center rounded-full border border-slate-200 p-1">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="grid h-7 w-7 place-items-center rounded-full text-slate-600 hover:bg-slate-100"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus size={13} />
                                </button>
                                <span className="w-7 text-center text-xs font-bold">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="grid h-7 w-7 place-items-center rounded-full text-slate-600 hover:bg-slate-100"
                                  aria-label="Increase quantity"
                                >
                                  <Plus size={13} />
                                </button>
                              </div>

                              <span className="text-sm font-bold text-slate-950">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 border-t border-slate-200 pt-6">
                      {!isOrdering ? (
                        <button
                          type="button"
                          onClick={() => setIsOrdering(true)}
                          className="w-full rounded-full bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800"
                        >
                          Continue to checkout
                        </button>
                      ) : (
                        <form onSubmit={handleOrderSubmit} className="space-y-4">
                          <div className="grid gap-4">
                            <Field
                              label="Your full name *"
                              value={customerName}
                              onChange={setCustomerName}
                              placeholder="e.g. John Doe"
                              required
                            />

                            <Field
                              label="Phone number *"
                              value={customerPhone}
                              onChange={setCustomerPhone}
                              placeholder="e.g. 0712345678"
                              type="tel"
                              required
                            />

                            <Field
                              label="Delivery address / location"
                              value={deliveryAddress}
                              onChange={setDeliveryAddress}
                              placeholder="e.g. Westlands, Nairobi"
                            />

                            <div>
                              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                Special instructions
                              </label>
                              <textarea
                                rows={3}
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                placeholder="Any specific requests?"
                                className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                              />
                            </div>
                          </div>

                          <div className="rounded-[20px] bg-slate-950 p-5 text-white">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-white/55">Total due</span>
                              <span className="text-xl font-bold">{formatPrice(totalCartAmount)}</span>
                            </div>

                            <button
                              type="submit"
                              disabled={submittingOrder}
                              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {submittingOrder ? "Submitting..." : "Confirm order"}
                              <Check size={16} />
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ORDER SUCCESS */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 18, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 18, scale: 0.98 }}
              className="w-full max-w-md rounded-[30px] bg-white p-7 text-center shadow-2xl"
            >
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={31} />
              </div>

              <h2 className="mt-5 text-3xl text-slate-950" style={serif}>
                Order received
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Thank you, <span className="font-semibold text-slate-800">{orderSuccess.orderedByName}</span>.
                Your order has been sent to {listing.businessName}.
              </p>

              <div className="mt-6 grid gap-2">
                {listing.phone && (
                  <a
                    href={`https://wa.me/${listing.phone.replace(
                      /[^0-9]/g,
                      ""
                    )}?text=${encodeURIComponent(
                      `Hi ${listing.businessName}, I just placed an order. My name is ${orderSuccess.orderedByName}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3.5 text-sm font-bold text-white"
                  >
                    <MessageCircle size={17} />
                    Chat on WhatsApp
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setOrderSuccess(null)}
                  className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GALLERY */}
      <AnimatePresence>
        {gallery && (
          <GalleryModal
            images={gallery.images}
            title={gallery.title}
            onClose={() => setGallery(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoCell({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 border-b border-slate-200 p-4 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0">
      <div className="mt-0.5 text-slate-500">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
          {label}
        </p>
        <p className="mt-1 truncate text-xs font-semibold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400"
      />
    </div>
  );
}


// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import {
//   MapPin, Star, Wifi, CheckCircle2, Phone, ChevronLeft, ChevronRight,
//   BedDouble, Car, Building2, Sparkles, Coffee, Shield,
//   BadgeCheck, AlertTriangle, ShoppingBag, Plus, Minus, Trash2,
//   X, Send, Check, MessageSquare, Package, Search, LayoutGrid, List, Lock
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import { toast } from "sonner";

// const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

// // ---------------------------------------------------------------------------
// // Design tokens — warm, editorial, photography-led. See design notes below.
// // ink:      #20302A  deep pine, primary text
// // bg:       #F6F1E7  cream page background
// // card:     #FFFDF8  card surface
// // line:     #E3DCC9  hairline border
// // sage:     #7C8A5C  secondary accent (chips, meta)
// // terracotta:#C1703F  warm accent (badges)
// // mustard:  #C89B3C  primary CTA accent
// // ---------------------------------------------------------------------------

// const FONT_LINK_ID = "hlynk-editorial-fonts";
// function useEditorialFonts() {
//   useEffect(() => {
//     if (document.getElementById(FONT_LINK_ID)) return;
//     const link = document.createElement("link");
//     link.id = FONT_LINK_ID;
//     link.rel = "stylesheet";
//     link.href = "https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600;700;800&display=swap";
//     document.head.appendChild(link);
//   }, []);
// }

// const serif = { fontFamily: "'Fraunces', Georgia, serif" };

// interface Room {
//   id: string;
//   title: string;
//   type: string;
//   code?: string;
//   parentId?: string;
//   basePrice: number;
//   status: string;
//   meta: {
//     roomType?: string;
//     amenities?: string[];
//     description?: string;
//     imageUrl?: string;
//     images?: string[];
//   };
// }

// interface Product {
//   id: string;
//   name: string;
//   category: string;
//   price: number;
//   stockLevel: number;
//   imageUrl?: string;
//   description?: string;
//   type?: string;
// }

// interface Property {
//   id: string;
//   title: string;
//   meta: { address?: string };
// }

// interface Listing {
//   businessName: string;
//   category?: string;
//   location?: string;
//   phone?: string;
//   slug: string;
//   businessType?: string;
//   properties: Property[];
//   rooms: Room[];
//   products: Product[];
// }

// interface CartItem {
//   id: string;
//   name: string;
//   price: number;
//   quantity: number;
//   type: "ROOM" | "PRODUCT";
//   imageUrl?: string;
// }

// interface GalleryState {
//   images: string[];
//   title: string;
// }

// type ViewMode = "grid" | "list";

// function AmenityIcon({ name }: { name: string }) {
//   const n = name.toLowerCase();
//   if (n.includes("wifi") || n.includes("internet")) return <Wifi size={11} />;
//   if (n.includes("coffee") || n.includes("breakfast")) return <Coffee size={11} />;
//   if (n.includes("park") || n.includes("car")) return <Car size={11} />;
//   if (n.includes("security") || n.includes("guard")) return <Shield size={11} />;
//   return <CheckCircle2 size={11} />;
// }

// function ViewToggle({ viewMode, setViewMode }: { viewMode: ViewMode; setViewMode: (v: ViewMode) => void }) {
//   return (
//     <div className="flex items-center bg-white border border-[#E3DCC9] rounded-full p-1 shrink-0">
//       <button
//         type="button"
//         onClick={() => setViewMode("grid")}
//         aria-label="Grid view"
//         aria-pressed={viewMode === "grid"}
//         className={`p-1.5 sm:p-2 rounded-full transition-all ${
//           viewMode === "grid" ? "bg-[#20302A] text-[#F6F1E7]" : "text-[#8A8271] hover:text-[#20302A]"
//         }`}
//       >
//         <LayoutGrid size={14} />
//       </button>
//       <button
//         type="button"
//         onClick={() => setViewMode("list")}
//         aria-label="List view"
//         aria-pressed={viewMode === "list"}
//         className={`p-1.5 sm:p-2 rounded-full transition-all ${
//           viewMode === "list" ? "bg-[#20302A] text-[#F6F1E7]" : "text-[#8A8271] hover:text-[#20302A]"
//         }`}
//       >
//         <List size={14} />
//       </button>
//     </div>
//   );
// }

// function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
//   return (
//     <div className="relative flex-1 min-w-0">
//       <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8271] pointer-events-none" />
//       <input
//         type="text"
//         value={value}
//         onChange={e => onChange(e.target.value)}
//         placeholder={placeholder}
//         className="w-full bg-white border border-[#E3DCC9] rounded-full pl-9 pr-3.5 py-2 sm:py-2.5 text-xs text-[#20302A] placeholder:text-[#A6A08C] focus:outline-none focus:border-[#C89B3C] transition-colors"
//       />
//       {value && (
//         <button
//           type="button"
//           onClick={() => onChange("")}
//           aria-label="Clear search"
//           className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A6A08C] hover:text-[#20302A] p-1"
//         >
//           <X size={12} />
//         </button>
//       )}
//     </div>
//   );
// }

// function GalleryModal({ images, title, onClose }: { images: string[]; title: string; onClose: () => void }) {
//   const [idx, setIdx] = useState(0);
//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[200] bg-[#141B14]/95 flex flex-col items-center justify-center p-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+1rem)]"
//       onClick={onClose}
//     >
//       <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
//         <div className="relative">
//           <img
//             src={images[idx]}
//             alt={`${title} - photo ${idx + 1}`}
//             className="w-full max-h-[65vh] sm:max-h-[75vh] object-contain rounded-2xl"
//           />
//           {images.length > 1 && (
//             <>
//               <button
//                 onClick={() => setIdx(i => (i - 1 + images.length) % images.length)}
//                 className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-white/20 text-white rounded-full p-2 sm:p-3 transition-all"
//                 aria-label="Previous photo"
//               >
//                 <ChevronLeft size={20} />
//               </button>
//               <button
//                 onClick={() => setIdx(i => (i + 1) % images.length)}
//                 className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-white/20 text-white rounded-full p-2 sm:p-3 transition-all"
//                 aria-label="Next photo"
//               >
//                 <ChevronRight size={20} />
//               </button>
//             </>
//           )}
//         </div>
//         <p className="text-center text-white/70 text-xs font-medium mt-3">{title} — {idx + 1} / {images.length}</p>
//         {images.length > 1 && (
//           <div className="flex justify-center gap-1.5 mt-3">
//             {images.map((_, i) => (
//               <button
//                 key={i}
//                 onClick={() => setIdx(i)}
//                 aria-label={`Go to photo ${i + 1}`}
//                 className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-[#C89B3C]" : "w-1.5 bg-white/30"}`}
//               />
//             ))}
//           </div>
//         )}
//         <button
//           onClick={onClose}
//           className="absolute -top-10 right-0 text-white/70 hover:text-white text-xs font-medium"
//         >
//           Close ✕
//         </button>
//       </div>
//     </motion.div>
//   );
// }

// export default function StayPage({ isShopMode }: { isShopMode?: boolean }) {
//   useEditorialFonts();
//   const { slug } = useParams<{ slug: string }>();
//   const isShopPath = isShopMode || (typeof window !== 'undefined' && window.location.pathname.startsWith('/shop'));
//   const [listing, setListing] = useState<Listing | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [activeTab, setActiveTab] = useState<"rooms" | "products">(isShopPath ? "products" : "rooms");
//   const [filter, setFilter] = useState("all");
//   const [categoryFilter, setCategoryFilter] = useState("all");

//   const [viewMode, setViewMode] = useState<ViewMode>("grid");
//   const [searchQuery, setSearchQuery] = useState("");

//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [isCartOpen, setIsCartOpen] = useState(false);
//   const [isOrdering, setIsOrdering] = useState(false);
//   const [orderSuccess, setOrderSuccess] = useState<any>(null);

//   const [gallery, setGallery] = useState<GalleryState | null>(null);

//   const [customerName, setCustomerName] = useState("");
//   const [customerPhone, setCustomerPhone] = useState("");
//   const [deliveryAddress, setDeliveryAddress] = useState("");
//   const [notes, setNotes] = useState("");
//   const [submittingOrder, setSubmittingOrder] = useState(false);

//   useEffect(() => {
//     if (!slug) return;
//     setLoading(true);
//     const endpoint = isShopPath ? `${API_URL}/api/v1/public/shop/${slug}` : `${API_URL}/api/v1/public/stay/${slug}`;
//     axios.get(endpoint)
//       .then(res => {
//         const data = res.data.data;
//         setListing(data);
//         if (isShopPath || (!data.rooms || data.rooms.length === 0)) {
//           if (data.products && data.products.length > 0) {
//             setActiveTab("products");
//           }
//         }
//       })
//       .catch(err => setError(err.response?.data?.message || "Listing not found"))
//       .finally(() => setLoading(false));
//   }, [slug, isShopPath]);

//   const switchTab = (tab: "rooms" | "products") => {
//     setActiveTab(tab);
//     setSearchQuery("");
//   };

//   const addToCart = (item: { id: string; name: string; price: number; type: "ROOM" | "PRODUCT"; imageUrl?: string }) => {
//     setCart(prev => {
//       const existing = prev.find(i => i.id === item.id);
//       if (existing) {
//         return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
//       }
//       return [...prev, { ...item, quantity: 1 }];
//     });
//     toast.success(`Added "${item.name}" to cart`);
//   };

//   const updateQuantity = (id: string, delta: number) => {
//     setCart(prev => prev.map(i => {
//       if (i.id === id) {
//         const newQty = i.quantity + delta;
//         return newQty > 0 ? { ...i, quantity: newQty } : i;
//       }
//       return i;
//     }));
//   };

//   const removeFromCart = (id: string) => {
//     setCart(prev => prev.filter(i => i.id !== id));
//   };

//   const totalCartAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

//   const handleOrderSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!customerName.trim() || !customerPhone.trim()) {
//       return toast.error("Please enter your name and phone number");
//     }
//     if (cart.length === 0) {
//       return toast.error("Your cart is empty");
//     }

//     setSubmittingOrder(true);
//     try {
//       const res = await axios.post(`${API_URL}/api/v1/public/order`, {
//         slug,
//         customerName,
//         customerPhone,
//         deliveryAddress,
//         notes,
//         items: cart,
//       });

//       const orderedByName = customerName;
//       setOrderSuccess({ ...res.data.data, orderedByName });
//       setCart([]);
//       setCustomerName("");
//       setCustomerPhone("");
//       setDeliveryAddress("");
//       setNotes("");
//       setIsOrdering(false);
//       setIsCartOpen(false);
//       toast.success("Order submitted successfully!");
//     } catch (err: any) {
//       toast.error(err.response?.data?.message || "Failed to submit order. Please try again.");
//     } finally {
//       setSubmittingOrder(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#F6F1E7] flex items-center justify-center">
//         <div className="flex flex-col items-center gap-4">
//           <div className="h-9 w-9 rounded-full border-[3px] border-[#20302A] border-t-transparent animate-spin" />
//           <p className="text-[#5B5544] text-xs font-medium tracking-wide">Loading listing…</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !listing) {
//     const isLockedError = error?.toLowerCase().includes("business pro") || error?.toLowerCase().includes("trial");

//     return (
//       <div className="min-h-screen bg-[#F6F1E7] flex items-center justify-center p-6">
//         <div className="bg-white border border-[#E3DCC9] p-8 rounded-2xl max-w-md w-full text-center space-y-5">
//           <div className="h-14 w-14 bg-[#C1703F]/10 text-[#C1703F] rounded-xl flex items-center justify-center mx-auto border border-[#C1703F]/20">
//             {isLockedError ? <Lock size={26} /> : <AlertTriangle size={26} />}
//           </div>
//           <div>
//             <h1 className="text-[#20302A] text-xl font-medium mb-2" style={serif}>
//               {isLockedError ? "Business Pro subscription required" : "Listing unavailable"}
//             </h1>
//             <p className="text-[#5B5544] text-xs leading-relaxed">
//               {error || "This store or listing does not exist."}
//             </p>
//           </div>

//           <div className="pt-2 flex flex-col gap-2.5">
//             {isLockedError ? (
//               <a
//                 href="/login"
//                 className="w-full py-3 bg-[#C89B3C] hover:bg-[#B98D30] text-[#20302A] font-semibold text-xs tracking-wide rounded-full transition-all flex items-center justify-center gap-2"
//               >
//                 Log in &amp; upgrade plan
//               </a>
//             ) : null}
//             <a
//               href="/"
//               className="w-full py-2.5 bg-[#F6F1E7] hover:bg-[#EFE7D6] text-[#5B5544] font-medium text-xs rounded-full transition-all flex items-center justify-center gap-2 border border-[#E3DCC9]"
//             >
//               ← Back to Hlynk home
//             </a>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const allRooms = listing.rooms || [];
//   const allProducts = listing.products || [];
//   const roomTypes = [...new Set(allRooms.map(r => r.type))];
//   const productCategories = [...new Set(allProducts.map(p => p.category || "General"))];

//   const normalizedQuery = searchQuery.trim().toLowerCase();

//   const filteredRooms = allRooms
//     .filter(r => filter === "all" || r.type === filter)
//     .filter(r => !normalizedQuery || r.title.toLowerCase().includes(normalizedQuery));

//   const filteredProducts = allProducts
//     .filter(p => categoryFilter === "all" || (p.category || "General") === categoryFilter)
//     .filter(p => !normalizedQuery || p.name.toLowerCase().includes(normalizedQuery));

//   const cartItemCount = cart.reduce((a, c) => a + c.quantity, 0);
//   const activeItems = activeTab === "rooms" && allRooms.length > 0 ? allRooms : allProducts;

//   // Pull real photography for the hero + sidebar gallery from whatever the
//   // business has actually uploaded — no stock imagery, no placeholders.
//   const heroImage =
//     allRooms.find(r => r.meta.imageUrl || (r.meta.images && r.meta.images.length))?.meta.imageUrl ||
//     allRooms.find(r => r.meta.images && r.meta.images.length)?.meta.images?.[0] ||
//     allProducts.find(p => p.imageUrl)?.imageUrl;

//   const galleryImages = [
//     ...allRooms.flatMap(r => (r.meta.images && r.meta.images.length ? r.meta.images : (r.meta.imageUrl ? [r.meta.imageUrl] : []))),
//     ...allProducts.map(p => p.imageUrl).filter(Boolean) as string[],
//   ].filter(Boolean).slice(0, 5);

//   const exploreGroups = activeTab === "rooms" && allRooms.length > 0
//     ? roomTypes.slice(0, 4).map(t => ({
//         label: t,
//         image: allRooms.find(r => r.type === t)?.meta.imageUrl || allRooms.find(r => r.type === t)?.meta.images?.[0],
//       }))
//     : productCategories.slice(0, 4).map(c => ({
//         label: c,
//         image: allProducts.find(p => (p.category || "General") === c)?.imageUrl,
//       }));

//   return (
//     <div className="min-h-screen bg-[#F6F1E7] text-[#20302A] pb-28 sm:pb-24" style={{ fontFamily: "'Inter', sans-serif" }}>
//       {/* HERO */}
//       <div className="relative">
//         <div className="relative mx-2 sm:mx-4 mt-2 sm:mt-4 rounded-[28px] overflow-hidden min-h-[420px] sm:min-h-[480px] bg-[#20302A]">
//           {heroImage ? (
//             <img src={heroImage} alt={listing.businessName} className="absolute inset-0 w-full h-full object-cover" />
//           ) : (
//             <div className="absolute inset-0 bg-gradient-to-br from-[#2B3D30] via-[#20302A] to-[#17201A]" />
//           )}
//           <div className="absolute inset-0 bg-gradient-to-t from-[#0F1610]/90 via-[#0F1610]/35 to-[#0F1610]/10" />

//           <div className="relative flex flex-col h-full min-h-[420px] sm:min-h-[480px] px-4 sm:px-8 pt-[calc(env(safe-area-inset-top)+1rem)] sm:pt-6 pb-6 sm:pb-8">
//             {/* top nav row */}
//             <div className="flex items-center justify-between gap-3">
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => window.history.back()}
//                   className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm"
//                   title="Go back"
//                 >
//                   <ChevronLeft size={16} />
//                 </button>
//                 <button
//                   onClick={() => window.history.forward()}
//                   className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm"
//                   title="Go forward"
//                 >
//                   <ChevronRight size={16} />
//                 </button>
//               </div>

//               <a href="/" className="italic text-white text-base sm:text-lg tracking-tight" style={serif}>
//                 {listing.businessName}
//               </a>

//               {cart.length > 0 ? (
//                 <button
//                   onClick={() => setIsCartOpen(true)}
//                   className="relative flex items-center gap-2 bg-[#C89B3C] text-[#20302A] pl-3 pr-3 py-2 rounded-full font-semibold text-xs shadow-lg transition-all hover:bg-[#B98D30]"
//                 >
//                   <ShoppingBag size={14} className="shrink-0" />
//                   <span className="hidden xs:inline whitespace-nowrap">{cartItemCount} · KES {totalCartAmount.toLocaleString()}</span>
//                   <span className="xs:hidden">{cartItemCount}</span>
//                 </button>
//               ) : (
//                 <div className="hidden sm:flex items-center gap-1.5 text-white/70">
//                   <Sparkles size={13} />
//                   <span className="text-[10px] tracking-wide">Powered by Hlynk</span>
//                 </div>
//               )}
//             </div>

//             {/* headline */}
//             <div className="flex-1 flex items-end mt-8">
//               <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg space-y-4">
//                 <div className="flex items-center gap-2 text-white/80">
//                   <BadgeCheck size={15} className="text-[#C89B3C] shrink-0" />
//                   <span className="text-[10px] font-medium tracking-[0.16em] uppercase">Verified business</span>
//                 </div>

//                 <h1 className="text-3xl sm:text-5xl leading-[1.05] text-white" style={serif}>
//                   {listing.category || listing.businessType || "Welcome"} <span className="italic text-[#C89B3C]">from {listing.businessName}</span>
//                 </h1>

//                 <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/75 pt-1">
//                   {listing.location && (
//                     <span className="flex items-center gap-1.5">
//                       <MapPin size={13} className="text-[#C89B3C] shrink-0" />
//                       {listing.location}
//                     </span>
//                   )}
//                   {listing.phone && (
//                     <a href={`tel:${listing.phone}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
//                       <Phone size={13} className="shrink-0" />
//                       {listing.phone}
//                     </a>
//                   )}
//                 </div>

//                 {activeItems.length > 0 && (
//                   <a
//                     href="#catalog"
//                     className="inline-flex items-center gap-2 mt-2 bg-white text-[#20302A] text-xs font-semibold px-5 py-3 rounded-full hover:bg-[#F6F1E7] transition-all"
//                   >
//                     {activeTab === "rooms" && allRooms.length > 0 ? "View rooms & spaces" : "Shop products"}
//                   </a>
//                 )}
//               </motion.div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Tabs (only if the business has both) */}
//       {allRooms.length > 0 && allProducts.length > 0 && (
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
//           <div className="flex items-center gap-6 border-b border-[#E3DCC9]">
//             <button
//               onClick={() => switchTab("rooms")}
//               className={`pb-3 text-xs font-semibold tracking-wide transition-all flex items-center gap-2 border-b-2 -mb-px ${
//                 activeTab === "rooms" ? "border-[#20302A] text-[#20302A]" : "border-transparent text-[#8A8271] hover:text-[#20302A]"
//               }`}
//             >
//               <BedDouble size={14} /> Rooms &amp; spaces ({allRooms.length})
//             </button>
//             <button
//               onClick={() => switchTab("products")}
//               className={`pb-3 text-xs font-semibold tracking-wide transition-all flex items-center gap-2 border-b-2 -mb-px ${
//                 activeTab === "products" ? "border-[#20302A] text-[#20302A]" : "border-transparent text-[#8A8271] hover:text-[#20302A]"
//               }`}
//             >
//               <Package size={14} /> Products &amp; shop ({allProducts.length})
//             </button>
//           </div>
//         </div>
//       )}

//       {/* MAIN BODY — editorial two column: catalog + sidebar */}
//       <div id="catalog" className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 sm:gap-10">
//         <div className="space-y-5 min-w-0">

//           {/* ROOMS */}
//           {activeTab === "rooms" && allRooms.length > 0 && (
//             <>
//               <div>
//                 <p className="text-xs text-[#8A8271] tracking-wide">Available now</p>
//                 <h2 className="text-2xl sm:text-3xl mt-1" style={serif}>
//                   Rooms &amp; <span className="italic">spaces</span>
//                 </h2>
//               </div>

//               <div className="flex items-center gap-2">
//                 <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search rooms & spaces..." />
//                 <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
//               </div>

//               {roomTypes.length > 1 && (
//                 <div className="flex flex-wrap gap-2">
//                   <button
//                     onClick={() => setFilter("all")}
//                     className={`px-4 py-1.5 rounded-full text-[11px] font-medium tracking-wide transition-all border ${
//                       filter === "all" ? "bg-[#20302A] text-white border-[#20302A]" : "bg-white text-[#5B5544] border-[#E3DCC9] hover:border-[#20302A]"
//                     }`}
//                   >
//                     All ({allRooms.length})
//                   </button>
//                   {roomTypes.map(t => (
//                     <button
//                       key={t}
//                       onClick={() => setFilter(t)}
//                       className={`px-4 py-1.5 rounded-full text-[11px] font-medium tracking-wide transition-all border ${
//                         filter === t ? "bg-[#20302A] text-white border-[#20302A]" : "bg-white text-[#5B5544] border-[#E3DCC9] hover:border-[#20302A]"
//                       }`}
//                     >
//                       {t} ({allRooms.filter(r => r.type === t).length})
//                     </button>
//                   ))}
//                 </div>
//               )}

//               {filteredRooms.length === 0 ? (
//                 <EmptyState query={searchQuery} />
//               ) : (
//                 <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5" : "flex flex-col gap-3"}>
//                   {filteredRooms.map(room => {
//                     const imgList = room.meta.images && room.meta.images.length > 0
//                       ? room.meta.images
//                       : (room.meta.imageUrl ? [room.meta.imageUrl] : []);
//                     const img = imgList[0];
//                     return (
//                       <ListingCard
//                         key={room.id}
//                         img={img}
//                         imgCount={imgList.length}
//                         onImgClick={() => img && setGallery({ images: imgList, title: room.title })}
//                         badge={room.type}
//                         title={room.title}
//                         description={room.meta.description}
//                         price={Number(room.basePrice)}
//                         isList={viewMode === "list"}
//                         ctaLabel="Book"
//                         fallbackIcon={<BedDouble size={viewMode === "list" ? 20 : 34} className="text-[#B7AF97]" />}
//                         onAdd={() => addToCart({ id: room.id, name: room.title, price: Number(room.basePrice), type: "ROOM", imageUrl: img })}
//                       />
//                     );
//                   })}
//                 </div>
//               )}
//             </>
//           )}

//           {/* PRODUCTS */}
//           {(activeTab === "products" || allRooms.length === 0) && allProducts.length > 0 && (
//             <>
//               <div>
//                 <p className="text-xs text-[#8A8271] tracking-wide">Fresh in store</p>
//                 <h2 className="text-2xl sm:text-3xl mt-1" style={serif}>
//                   Bestselling <span className="italic">products</span>
//                 </h2>
//               </div>

//               <div className="flex items-center gap-2">
//                 <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search products..." />
//                 <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
//               </div>

//               {productCategories.length > 1 && (
//                 <div className="flex items-center gap-1.5 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar py-1">
//                   <button
//                     onClick={() => setCategoryFilter("all")}
//                     className={`px-4 py-1.5 rounded-full text-[11px] font-medium tracking-wide transition-all border whitespace-nowrap ${
//                       categoryFilter === "all" ? "bg-[#20302A] text-white border-[#20302A]" : "bg-white text-[#5B5544] border-[#E3DCC9] hover:border-[#20302A]"
//                     }`}
//                   >
//                     All ({allProducts.length})
//                   </button>
//                   {productCategories.map(c => (
//                     <button
//                       key={c}
//                       onClick={() => setCategoryFilter(c)}
//                       className={`ml-2 px-4 py-1.5 rounded-full text-[11px] font-medium tracking-wide transition-all border whitespace-nowrap ${
//                         categoryFilter === c ? "bg-[#20302A] text-white border-[#20302A]" : "bg-white text-[#5B5544] border-[#E3DCC9] hover:border-[#20302A]"
//                       }`}
//                     >
//                       {c} ({allProducts.filter(p => (p.category || "General") === c).length})
//                     </button>
//                   ))}
//                 </div>
//               )}

//               {filteredProducts.length === 0 ? (
//                 <EmptyState query={searchQuery} />
//               ) : (
//                 <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5" : "flex flex-col gap-3"}>
//                   {filteredProducts.map(prod => (
//                     <ListingCard
//                       key={prod.id}
//                       img={prod.imageUrl}
//                       imgCount={prod.imageUrl ? 1 : 0}
//                       onImgClick={() => prod.imageUrl && setGallery({ images: [prod.imageUrl], title: prod.name })}
//                       badge={prod.category || "General"}
//                       title={prod.name}
//                       description={prod.description}
//                       price={Number(prod.price)}
//                       isList={viewMode === "list"}
//                       ctaLabel="Add"
//                       fallbackIcon={<Package size={viewMode === "list" ? 20 : 34} className="text-[#B7AF97]" />}
//                       onAdd={() => addToCart({ id: prod.id, name: prod.name, price: Number(prod.price), type: "PRODUCT", imageUrl: prod.imageUrl })}
//                     />
//                   ))}
//                 </div>
//               )}
//             </>
//           )}

//           {/* Empty catalog */}
//           {allRooms.length === 0 && allProducts.length === 0 && (
//             <div className="p-8 bg-white border border-[#E3DCC9] rounded-2xl text-center space-y-3">
//               <Package size={40} className="mx-auto text-[#C89B3C] opacity-70 mb-1" />
//               <h3 className="text-lg" style={serif}>Catalog coming soon</h3>
//               <p className="text-xs text-[#5B5544]">
//                 This business has not published any items or services yet. Please check back shortly or call them directly.
//               </p>
//               {listing.phone && (
//                 <a
//                   href={`tel:${listing.phone}`}
//                   className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 bg-[#20302A] hover:bg-[#17201A] text-white text-xs font-semibold rounded-full transition-all"
//                 >
//                   <Phone size={14} /> Call business
//                 </a>
//               )}
//             </div>
//           )}
//         </div>

//         {/* SIDEBAR */}
//         <aside className="space-y-5">
//           {/* Explore strip */}
//           {exploreGroups.length > 1 && (
//             <div className="grid grid-cols-4 gap-1.5">
//               {exploreGroups.map((g, i) => (
//                 <button
//                   key={i}
//                   onClick={() => activeTab === "rooms" ? setFilter(g.label) : setCategoryFilter(g.label)}
//                   className="relative aspect-square rounded-xl overflow-hidden bg-[#20302A] group"
//                 >
//                   {g.image ? (
//                     <img src={g.image} alt={g.label} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
//                   ) : (
//                     <div className="w-full h-full flex items-center justify-center bg-[#2B3D30]">
//                       <Building2 size={16} className="text-white/50" />
//                     </div>
//                   )}
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
//                   <span className="absolute bottom-1.5 left-1.5 right-1.5 text-white text-[8px] font-medium truncate text-left">{g.label}</span>
//                 </button>
//               ))}
//             </div>
//           )}

//           {/* Best sellers block */}
//           {activeItems.length > 0 && (
//             <div className="bg-white border border-[#E3DCC9] rounded-2xl p-5">
//               <p className="text-[10px] text-[#8A8271] tracking-[0.14em] uppercase mb-1">Best {activeTab === "rooms" ? "spaces" : "sellers"}</p>
//               <h3 className="text-xl mb-3" style={serif}>
//                 Loved by <span className="italic">guests</span>
//               </h3>
//               <div className="grid grid-cols-2 gap-2">
//                 {activeItems.slice(0, 2).map((item: any, i) => {
//                   const img = item.meta?.imageUrl || item.meta?.images?.[0] || item.imageUrl;
//                   const name = item.title || item.name;
//                   return (
//                     <div key={i} className="rounded-xl overflow-hidden bg-[#F6F1E7] aspect-[4/5] relative">
//                       {img ? (
//                         <img src={img} alt={name} className="w-full h-full object-cover" />
//                       ) : (
//                         <div className="w-full h-full flex items-center justify-center">
//                           <Package size={20} className="text-[#B7AF97]" />
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           )}

//           {/* Gallery */}
//           {galleryImages.length > 0 && (
//             <div className="bg-white border border-[#E3DCC9] rounded-2xl p-5">
//               <p className="text-[10px] text-[#8A8271] tracking-[0.14em] uppercase mb-1">Gallery</p>
//               <h3 className="text-xl mb-3" style={serif}>A closer <span className="italic">look</span></h3>
//               <div className="grid grid-cols-3 gap-1.5">
//                 {galleryImages.map((img, i) => (
//                   <button
//                     key={i}
//                     onClick={() => setGallery({ images: galleryImages, title: listing.businessName })}
//                     className={`relative rounded-lg overflow-hidden bg-[#F6F1E7] ${i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"}`}
//                   >
//                     <img src={img} alt="" className="w-full h-full object-cover" />
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Contact / commitment banner */}
//           <div className="bg-[#20302A] rounded-2xl p-5 text-white">
//             <p className="text-[10px] text-[#C89B3C] tracking-[0.14em] uppercase mb-2">Get in touch</p>
//             <p className="text-sm leading-relaxed text-white/85">
//               Have a question before you order? Reach <span className="italic" style={serif}>{listing.businessName}</span> directly and they'll get right back to you.
//             </p>
//             <div className="flex flex-col gap-2 mt-4">
//               {listing.phone && (
//                 <a href={`tel:${listing.phone}`} className="flex items-center gap-2 text-xs font-medium bg-white/10 hover:bg-white/20 rounded-full px-4 py-2.5 transition-all">
//                   <Phone size={13} /> {listing.phone}
//                 </a>
//               )}
//               {listing.phone && (
//                 <a
//                   href={`https://wa.me/${listing.phone.replace(/[^0-9]/g, "")}`}
//                   target="_blank" rel="noopener noreferrer"
//                   className="flex items-center gap-2 text-xs font-medium bg-[#C89B3C] hover:bg-[#B98D30] text-[#20302A] rounded-full px-4 py-2.5 transition-all"
//                 >
//                   <MessageSquare size={13} /> WhatsApp
//                 </a>
//               )}
//             </div>
//           </div>
//         </aside>
//       </div>

//       {/* Floating bottom cart bar */}
//       {cart.length > 0 && !isCartOpen && (
//         <div className="fixed bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-40 max-w-xl mx-auto pb-[env(safe-area-inset-bottom)]">
//           <div className="bg-[#20302A] text-white p-3 sm:p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3">
//             <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
//               <div className="bg-[#C89B3C] text-[#20302A] h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
//                 {cartItemCount}
//               </div>
//               <div className="min-w-0">
//                 <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wide truncate text-white/70">Total selected</p>
//                 <p className="text-base sm:text-lg font-semibold leading-none truncate">KES {totalCartAmount.toLocaleString()}</p>
//               </div>
//             </div>

//             <button
//               onClick={() => { setIsCartOpen(true); setIsOrdering(true); }}
//               className="shrink-0 bg-[#C89B3C] hover:bg-[#B98D30] text-[#20302A] font-semibold text-[11px] sm:text-xs tracking-wide px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl flex items-center gap-1.5 sm:gap-2 transition-all"
//             >
//               Order now <Send size={13} />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* CART & CHECKOUT MODAL */}
//       <AnimatePresence>
//         {isCartOpen && (
//           <motion.div
//             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//             className="fixed inset-0 z-50 bg-[#141B14]/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
//           >
//             <motion.div
//               initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }}
//               className="bg-[#FFFDF8] border border-[#E3DCC9] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 space-y-5 sm:space-y-6 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto text-[#20302A] pb-[calc(env(safe-area-inset-bottom)+1.25rem)] sm:pb-6"
//             >
//               <div className="flex items-center justify-between border-b border-[#E3DCC9] pb-4 sticky -top-5 sm:-top-6 bg-[#FFFDF8] pt-1 -mx-5 sm:-mx-6 px-5 sm:px-6 z-10">
//                 <div className="flex items-center gap-2">
//                   <ShoppingBag className="text-[#C89B3C]" size={20} />
//                   <h2 className="text-lg" style={serif}>Your order</h2>
//                 </div>
//                 <button onClick={() => setIsCartOpen(false)} className="text-[#8A8271] hover:text-[#20302A] p-1">
//                   <X size={20} />
//                 </button>
//               </div>

//               <div className="space-y-3 max-h-40 sm:max-h-48 overflow-y-auto pr-1">
//                 {cart.map(item => (
//                   <div key={item.id} className="flex items-center justify-between gap-2 bg-[#F6F1E7] p-3 rounded-xl border border-[#E3DCC9]">
//                     <div className="min-w-0">
//                       <p className="font-semibold text-xs truncate">{item.name}</p>
//                       <p className="text-[10px] text-[#8A8271] font-medium">KES {item.price.toLocaleString()} each</p>
//                     </div>

//                     <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
//                       <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 bg-white border border-[#E3DCC9] rounded-lg hover:bg-[#EFE7D6]">
//                         <Minus size={12} />
//                       </button>
//                       <span className="text-xs font-semibold w-4 text-center">{item.quantity}</span>
//                       <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 bg-white border border-[#E3DCC9] rounded-lg hover:bg-[#EFE7D6]">
//                         <Plus size={12} />
//                       </button>
//                       <button onClick={() => removeFromCart(item.id)} className="p-1.5 text-[#C1703F] hover:text-[#A85E33] ml-1">
//                         <Trash2 size={13} />
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <form onSubmit={handleOrderSubmit} className="space-y-3 pt-3 border-t border-[#E3DCC9]">
//                 <div>
//                   <label className="text-[10px] font-semibold uppercase tracking-wide text-[#8A8271] block mb-1">Your full name *</label>
//                   <input
//                     type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)}
//                     placeholder="e.g. John Doe"
//                     className="w-full bg-white border border-[#E3DCC9] rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-[#20302A] placeholder:text-[#A6A08C] focus:outline-none focus:border-[#C89B3C]"
//                   />
//                 </div>

//                 <div>
//                   <label className="text-[10px] font-semibold uppercase tracking-wide text-[#8A8271] block mb-1">Your phone number *</label>
//                   <input
//                     type="number" required value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
//                     placeholder="e.g. 0712345678"
//                     className="w-full bg-white border border-[#E3DCC9] rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-[#20302A] placeholder:text-[#A6A08C] focus:outline-none focus:border-[#C89B3C]"
//                   />
//                 </div>

//                 <div>
//                   <label className="text-[10px] font-semibold uppercase tracking-wide text-[#8A8271] block mb-1">Delivery address / room # / location</label>
//                   <input
//                     type="text" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)}
//                     placeholder="e.g. Room 204 or Westlands Nairobi"
//                     className="w-full bg-white border border-[#E3DCC9] rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-[#20302A] placeholder:text-[#A6A08C] focus:outline-none focus:border-[#C89B3C]"
//                   />
//                 </div>

//                 <div>
//                   <label className="text-[10px] font-semibold uppercase tracking-wide text-[#8A8271] block mb-1">Special instructions / notes</label>
//                   <textarea
//                     rows={2} value={notes} onChange={e => setNotes(e.target.value)}
//                     placeholder="Any specific requests?"
//                     className="w-full bg-white border border-[#E3DCC9] rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-[#20302A] placeholder:text-[#A6A08C] focus:outline-none focus:border-[#C89B3C] resize-none"
//                   />
//                 </div>

//                 <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
//                   <div>
//                     <span className="text-[9px] font-semibold text-[#8A8271] uppercase tracking-wide block">Total due</span>
//                     <span className="text-xl font-semibold text-[#20302A]">KES {totalCartAmount.toLocaleString()}</span>
//                   </div>

//                   <button
//                     type="submit" disabled={submittingOrder}
//                     className="px-6 py-3 bg-[#20302A] hover:bg-[#17201A] text-white font-semibold text-xs tracking-wide rounded-full transition-all flex items-center gap-2 disabled:opacity-50"
//                   >
//                     {submittingOrder ? "Submitting..." : "Confirm order"} <Check size={14} />
//                   </button>
//                 </div>
//               </form>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* ORDER SUCCESS MODAL */}
//       <AnimatePresence>
//         {orderSuccess && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#141B14]/80 flex items-center justify-center p-4">
//             <div className="bg-[#FFFDF8] border border-[#E3DCC9] p-5 sm:p-6 rounded-3xl max-w-md w-full text-center space-y-4 max-h-[90vh] overflow-y-auto">
//               <div className="h-14 w-14 rounded-full bg-[#C89B3C]/15 text-[#C89B3C] flex items-center justify-center mx-auto">
//                 <CheckCircle2 size={30} />
//               </div>
//               <h2 className="text-2xl" style={serif}>Order received</h2>
//               <p className="text-xs text-[#5B5544] leading-relaxed">
//                 Thank you, <span className="font-semibold text-[#20302A]">{orderSuccess.orderedByName}</span>! Your order has been placed with <span className="font-semibold">{listing.businessName}</span>. They will reach out to confirm shortly.
//               </p>
//               <div className="bg-[#F6F1E7] border border-[#E3DCC9] p-3 rounded-2xl text-xs text-[#5B5544]">
//                 Your order has been saved. The business will contact you on the phone number you provided.
//               </div>
//               <div className="pt-2 flex flex-col gap-2">
//                 {listing.phone && (
//                   <a
//                     href={`https://wa.me/${listing.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${listing.businessName}, I just placed an order on your online store. My name is ${orderSuccess.orderedByName}.`)}`}
//                     target="_blank" rel="noopener noreferrer"
//                     className="w-full py-3 bg-[#20302A] hover:bg-[#17201A] text-white font-semibold text-sm rounded-full flex items-center justify-center gap-2"
//                   >
//                     <MessageSquare size={16} /> Chat on WhatsApp
//                   </a>
//                 )}
//                 <button
//                   onClick={() => setOrderSuccess(null)}
//                   className="w-full py-2.5 bg-[#F6F1E7] hover:bg-[#EFE7D6] text-[#5B5544] font-medium text-sm rounded-full border border-[#E3DCC9]"
//                 >
//                   Done
//                 </button>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* PHOTO GALLERY MODAL */}
//       <AnimatePresence>
//         {gallery && (
//           <GalleryModal images={gallery.images} title={gallery.title} onClose={() => setGallery(null)} />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// function EmptyState({ query }: { query: string }) {
//   return (
//     <div className="py-12 text-center">
//       <Search size={26} className="mx-auto text-[#B7AF97] mb-3" />
//       <p className="text-sm font-medium text-[#20302A]">No matches for "{query}"</p>
//       <p className="text-xs text-[#8A8271] mt-1">Try a different search term.</p>
//     </div>
//   );
// }

// function ListingCard({
//   img, imgCount, onImgClick, badge, title, description, price, isList, ctaLabel, fallbackIcon, onAdd,
// }: {
//   img?: string; imgCount: number; onImgClick: () => void; badge: string; title: string; description?: string;
//   price: number; isList: boolean; ctaLabel: string; fallbackIcon: React.ReactNode; onAdd: () => void;
// }) {
//   return (
//     <div className={`bg-white border border-[#E3DCC9] rounded-2xl overflow-hidden ${isList ? "flex flex-row items-stretch" : "flex flex-col"}`}>
//       <button
//         type="button"
//         onClick={onImgClick}
//         disabled={!img}
//         className={`relative bg-[#F6F1E7] overflow-hidden text-left disabled:cursor-default shrink-0 ${isList ? "w-28 sm:w-36" : "h-44 sm:h-48 w-full"}`}
//       >
//         {img ? (
//           <img src={img} alt={title} className="w-full h-full object-cover" />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center">{fallbackIcon}</div>
//         )}
//         <span className="absolute top-2.5 left-2.5 bg-white/95 text-[#5B5544] text-[9px] font-semibold tracking-wide px-2.5 py-1 rounded-full">
//           {badge}
//         </span>
//         {imgCount > 1 && (
//           <span className={`absolute bg-black/55 backdrop-blur-sm text-white font-medium px-2 py-0.5 rounded-full ${isList ? "bottom-1.5 right-1.5 text-[8px]" : "bottom-2.5 right-2.5 text-[9px]"}`}>
//             +{imgCount - 1}
//           </span>
//         )}
//       </button>

//       <div className={isList ? "p-3 sm:p-4 flex-1 min-w-0 flex flex-col justify-center gap-2" : "p-4 space-y-2 flex-1 flex flex-col justify-between"}>
//         <div className={isList ? "min-w-0" : ""}>
//           <h3 className={`font-semibold text-[#20302A] ${isList ? "text-sm truncate" : "text-base"}`}>{title}</h3>
//           {description && !isList && (
//             <p className="text-xs text-[#8A8271] line-clamp-2 mt-1">{description}</p>
//           )}
//         </div>

//         <div className={isList ? "flex items-center justify-between gap-2" : "flex items-center justify-between gap-3 pt-2 border-t border-[#E3DCC9]"}>
//           <span className={`font-semibold text-[#20302A] truncate ${isList ? "text-sm" : "text-base"}`}>
//             KES {price.toLocaleString()}
//           </span>
//           <button
//             onClick={onAdd}
//             className={`shrink-0 bg-[#20302A] hover:bg-[#17201A] text-white font-semibold rounded-full flex items-center gap-1.5 transition-all whitespace-nowrap ${isList ? "px-3 py-1.5 text-[10px]" : "px-4 py-2 text-[11px]"}`}
//           >
//             <Plus size={isList ? 12 : 13} /> {ctaLabel}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }