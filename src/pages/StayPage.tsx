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
  Truck,
  Smartphone,
  Loader2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

// Universal storefront banner. Add the image at public/store-banner.jpg.
const UNIVERSAL_BANNER_IMAGE = "/store-banner.jpg";

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
  hasMpesaGateway?: boolean;
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
  const fallback = "title" in item ? <BedDouble size={24} /> : <Package size={24} />;

  if (isList) {
    return (
      <article className="group flex min-h-[68px] w-full overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm">
        <button
          type="button"
          disabled={!image}
          onClick={onImageClick}
          className="relative h-[68px] w-[68px] min-w-[68px] overflow-hidden bg-[#f3f1ec] text-left disabled:cursor-default sm:h-[76px] sm:w-[76px] sm:min-w-[76px]"
          aria-label={image ? `View photos of ${title}` : undefined}
        >
          {image ? (
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="grid h-full place-items-center text-slate-400">{fallback}</div>
          )}
          {imageCount > 1 && (
            <span className="absolute bottom-1 right-1 rounded-full bg-slate-950/70 px-1.5 py-0.5 text-[8px] font-semibold text-white">
              +{imageCount - 1}
            </span>
          )}
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2 sm:px-3.5">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="truncate text-[13px] font-semibold tracking-tight text-slate-950">{title}</h3>
              {category && (
                <span className="hidden shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-slate-500 sm:inline-flex">
                  {category}
                </span>
              )}
            </div>
            {description && (
              <p className="mt-0.5 line-clamp-1 text-[10px] leading-4 text-slate-500">
                {description}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="whitespace-nowrap text-xs font-bold tracking-tight text-slate-950 sm:text-[13px]">
              {formatPrice(price)}
            </span>
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex h-8 items-center gap-1 rounded-full bg-slate-950 px-2.5 text-[10px] font-semibold text-white transition hover:bg-slate-800 active:scale-95 sm:px-3"
            >
              <Plus size={12} />
              <span className="hidden xs:inline">{ctaLabel}</span>
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-[16px] border border-slate-200 bg-white transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_32px_rgba(15,23,42,0.07)]">
      <button
        type="button"
        disabled={!image}
        onClick={onImageClick}
        className="relative aspect-[1.12/1] w-full overflow-hidden bg-[#f3f1ec] text-left disabled:cursor-default"
        aria-label={image ? `View photos of ${title}` : undefined}
      >
        {image ? (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
          />
        ) : (
          <div className="grid h-full place-items-center text-slate-400">{fallback}</div>
        )}

        <span className="absolute left-2 top-2 max-w-[calc(100%-16px)] truncate rounded-full bg-white/95 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.08em] text-slate-600 shadow-sm backdrop-blur">
          {category}
        </span>

        {imageCount > 1 && (
          <span className="absolute bottom-2 right-2 rounded-full bg-slate-950/65 px-2 py-0.5 text-[8px] font-medium text-white backdrop-blur">
            +{imageCount - 1} photos
          </span>
        )}
      </button>

      <div className="flex min-h-[108px] flex-1 flex-col p-2.5 sm:p-3">
        <div className="min-w-0">
          <h3 className="truncate text-[13px] font-semibold tracking-tight text-slate-950">{title}</h3>
          {description && (
            <p className="mt-0.5 line-clamp-1 text-[10px] leading-4 text-slate-500">
              {description}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2.5">
          <div className="min-w-0">
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
              {ctaLabel === "Book" ? "From" : "Price"}
            </p>
            <p className="mt-0.5 truncate text-xs font-bold tracking-tight text-slate-950 sm:text-[13px]">
              {formatPrice(price)}
            </p>
          </div>

          <button
            type="button"
            onClick={onAdd}
            className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-slate-950 px-2.5 text-[10px] font-semibold text-white transition hover:bg-slate-800 active:scale-95"
          >
            <Plus size={12} />
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
      (window.location.pathname.startsWith("/shop") || window.location.pathname.startsWith("/store")));

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

  const [paymentOption, setPaymentOption] = useState<"PAY_ON_DELIVERY" | "PAY_UPFRONT">("PAY_ON_DELIVERY");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [stkStatus, setStkStatus] = useState<"IDLE" | "SENDING" | "SENT" | "FAILED">("IDLE");
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (listing && listing.hasMpesaGateway === false && paymentOption === "PAY_UPFRONT") {
      setPaymentOption("PAY_ON_DELIVERY");
    }
  }, [listing, paymentOption]);

  const handleInitiateStkPush = async (): Promise<string | null> => {
    const phoneToUse = (mpesaPhone.trim() || customerPhone.trim());
    if (!phoneToUse) {
      toast.error("Please enter your M-Pesa phone number");
      return null;
    }
    if (!totalCartAmount || totalCartAmount <= 0) {
      toast.error("Cart total is zero");
      return null;
    }

    setStkStatus("SENDING");
    try {
      const res = await axios.post(`${API_URL}/api/v1/public/mpesa-push`, {
        slug,
        phone: phoneToUse,
        amount: totalCartAmount,
        customerName: customerName.trim() || "Customer",
      });

      if (res.data.success) {
        const reqId = res.data.data?.CheckoutRequestID || null;
        setCheckoutRequestId(reqId);
        setStkStatus("SENT");
        toast.success("M-Pesa STK Push prompt sent to your phone!");
        return reqId;
      } else {
        setStkStatus("FAILED");
        toast.error(res.data.message || "Failed to send M-Pesa prompt");
        return null;
      }
    } catch (err: any) {
      setStkStatus("FAILED");
      toast.error(err.response?.data?.message || "Failed to send M-Pesa prompt");
      return null;
    }
  };

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

    if (paymentOption === "PAY_UPFRONT" && listing?.hasMpesaGateway === false) {
      toast.error("M-Pesa payment gateway is not configured by this merchant.");
      return;
    }

    setSubmittingOrder(true);
    let activeReqId = checkoutRequestId;

    try {
      if (paymentOption === "PAY_UPFRONT" && !activeReqId) {
        activeReqId = await handleInitiateStkPush();
        if (!activeReqId) {
          setSubmittingOrder(false);
          return;
        }
      }

      const response = await axios.post(`${API_URL}/api/v1/public/order`, {
        slug,
        customerName,
        customerPhone,
        deliveryAddress,
        notes,
        items: cart,
        paymentOption,
        checkoutRequestId: activeReqId,
      });

      setOrderSuccess({
        ...response.data.data,
        orderedByName: customerName,
        paymentOption,
      });

      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setDeliveryAddress("");
      setNotes("");
      setMpesaPhone("");
      setCheckoutRequestId(null);
      setStkStatus("IDLE");
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
      <header className="sticky top-0 z-40 border-b pt-5 border-slate-200/80 bg-[#f7f7f5]/90 backdrop-blur-xl">
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
        {/* UNIVERSAL STOREFRONT BANNER
            Product/service photos stay exclusively inside the catalogue. */}
        <section className="relative mt-1 overflow-hidden rounded-[26px] bg-slate-950">
          <img
            src={UNIVERSAL_BANNER_IMAGE}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/15" />

          <div className="relative flex min-h-[300px] items-end p-6 sm:min-h-[350px] sm:p-9 lg:min-h-[390px]">
            <div className="max-w-2xl">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white backdrop-blur">
                  <Sparkles size={12} />
                  {listing.category || listing.businessType || "Store"}
                </span>

                {listing.location && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/15 px-3 py-1.5 text-[11px] text-white/75 backdrop-blur">
                    <MapPin size={12} />
                    {listing.location}
                  </span>
                )}
              </div>

              <h1
                className="text-4xl leading-[1.02] text-white sm:text-5xl lg:text-6xl"
                style={serif}
              >
                {listing.businessName}
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
                Browse what is available, choose what you need and order
                directly from the business.
              </p>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <a
                  href="#catalog"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold text-slate-950 transition hover:bg-slate-100"
                >
                  Browse collection
                  <ChevronRight size={15} />
                </a>

                {listing.phone && (
                  <a
                    href={`tel:${listing.phone}`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/15"
                  >
                    <Phone size={14} />
                    Contact
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* COMPACT STORE INFO — no repeated product/service display */}
        <section className="mt-4 grid overflow-hidden rounded-[20px] border border-slate-200 bg-white sm:grid-cols-2 lg:grid-cols-4">
          <InfoCell
            icon={<ShoppingBag size={16} />}
            label="Collection"
            value={`${activeItems.length} item${activeItems.length === 1 ? "" : "s"} available`}
          />
          <InfoCell
            icon={<CheckCircle2 size={16} />}
            label="Ordering"
            value="Direct ordering available"
          />
          <InfoCell
            icon={<MapPin size={16} />}
            label="Location"
            value={listing.location || "Contact business"}
          />
          <InfoCell
            icon={<Phone size={16} />}
            label="Support"
            value={listing.phone || "Available through the business"}
          />
        </section>

        {/* CATALOG */}
        <section id="catalog" className="mt-10 scroll-mt-24">
          {allRooms.length > 0 && allProducts.length > 0 && (
            <div className="mb-7 flex items-center gap-2 overflow-x-auto border-b border-slate-200 no-scrollbar">
              <button
                type="button"
                onClick={() => switchTab("rooms")}
                className={`relative px-4 py-3 text-sm font-semibold transition ${activeTab === "rooms"
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
                className={`relative px-4 py-3 text-sm font-semibold transition ${activeTab === "products"
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
                  className={`grid h-9 w-9 place-items-center rounded-full transition ${viewMode === "grid"
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
                  className={`grid h-9 w-9 place-items-center rounded-full transition ${viewMode === "list"
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
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition ${currentFilter === "all"
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
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition ${currentFilter === category
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          <div className="mt-4">
            {activeTab === "rooms" && allRooms.length > 0 && (
              filteredRooms.length ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                      : "grid gap-2"
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
                      ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                      : "grid gap-2"
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
              <div className="flex items-center justify-between border-b border-slate-200 px-5 pb-5 pt-10 sm:px-7">
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
                                rows={2}
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                placeholder="Any specific requests?"
                                className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                              />
                            </div>

                            {/* PAYMENT METHOD SELECTION */}
                            <div>
                              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                Payment Method
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPaymentOption("PAY_ON_DELIVERY");
                                    setStkStatus("IDLE");
                                    setCheckoutRequestId(null);
                                  }}
                                  className={`flex flex-col justify-between rounded-2xl border p-3.5 text-left transition ${
                                    paymentOption === "PAY_ON_DELIVERY"
                                      ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Truck size={15} className={paymentOption === "PAY_ON_DELIVERY" ? "text-white" : "text-slate-500"} />
                                    <span className="text-xs font-bold">Pay on Delivery</span>
                                  </div>
                                  <span className={`mt-2 text-[11px] leading-tight ${paymentOption === "PAY_ON_DELIVERY" ? "text-slate-300" : "text-slate-500"}`}>
                                    Pay cash or transfer upon receiving
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  disabled={listing?.hasMpesaGateway === false}
                                  onClick={() => {
                                    if (listing?.hasMpesaGateway !== false) {
                                      setPaymentOption("PAY_UPFRONT");
                                    }
                                  }}
                                  className={`flex flex-col justify-between rounded-2xl border p-3.5 text-left transition ${
                                    listing?.hasMpesaGateway === false
                                      ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-60 text-slate-400"
                                      : paymentOption === "PAY_UPFRONT"
                                      ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Smartphone size={15} className={paymentOption === "PAY_UPFRONT" && listing?.hasMpesaGateway !== false ? "text-white" : "text-slate-400"} />
                                    <span className="text-xs font-bold">Pay Upfront</span>
                                  </div>
                                  <span className={`mt-2 text-[11px] leading-tight ${
                                    listing?.hasMpesaGateway === false
                                      ? "text-slate-400 font-medium"
                                      : paymentOption === "PAY_UPFRONT"
                                      ? "text-slate-300"
                                      : "text-slate-500"
                                  }`}>
                                    {listing?.hasMpesaGateway === false ? "Not configured by vendor" : "M-Pesa STK push prompt"}
                                  </span>
                                </button>
                              </div>
                            </div>

                            {/* MPESA STK PUSH DETAILS (UPFRONT PAYMENT) */}
                            {paymentOption === "PAY_UPFRONT" && (
                              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
                                <Field
                                  label="M-Pesa Phone Number"
                                  value={mpesaPhone || customerPhone}
                                  onChange={setMpesaPhone}
                                  placeholder="e.g. 0712345678"
                                  type="tel"
                                />

                                {stkStatus === "SENT" ? (
                                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 flex items-start gap-2.5 text-emerald-900">
                                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                                    <p className="text-xs font-medium leading-relaxed">
                                      STK push prompt sent to <span className="font-bold">{mpesaPhone || customerPhone}</span>. Enter your M-Pesa PIN on your phone to complete payment.
                                    </p>
                                  </div>
                                ) : (
                                  <div className="rounded-xl border border-slate-200 bg-white p-3 flex items-start gap-2 text-slate-600">
                                    <Smartphone size={15} className="mt-0.5 shrink-0 text-slate-500" />
                                    <p className="text-xs leading-relaxed">
                                      An M-Pesa PIN prompt will be sent to <span className="font-semibold text-slate-900">{mpesaPhone || customerPhone || "your phone"}</span> when you click submit below.
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
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
                              {submittingOrder ? (
                                <>
                                  <Loader2 size={16} className="animate-spin" />
                                  {paymentOption === "PAY_UPFRONT" ? "Initiating STK Push..." : "Submitting Order..."}
                                </>
                              ) : paymentOption === "PAY_UPFRONT" ? (
                                stkStatus === "SENT" ? "Confirm & Complete Order" : "Pay with M-Pesa & Submit Order"
                              ) : (
                                "Confirm Order (Pay on Delivery)"
                              )}
                              {!submittingOrder && <Check size={16} />}
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
                Your order has been sent to {listing?.businessName || "the business owner"}.
              </p>

              {orderSuccess.paymentOption === "PAY_UPFRONT" ? (
                <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-left text-xs leading-relaxed text-emerald-950">
                  <p className="font-bold text-emerald-900 mb-1">M-Pesa Prompt Triggered 📲</p>
                  If you entered your PIN, retain the M-Pesa confirmation message to show upon delivery or check-in if needed.
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-left text-xs leading-relaxed text-slate-700">
                  <p className="font-bold text-slate-900 mb-1">Pay on Delivery Selected 🚚</p>
                  You can pay cash or make a mobile transfer directly to the business owner upon delivery or arrival.
                </div>
              )}

              <div className="mt-6 grid gap-2">
                {listing?.phone && (
                  <a
                    href={`https://wa.me/${listing.phone.replace(
                      /[^0-9]/g,
                      ""
                    )}?text=${encodeURIComponent(
                      `Hi ${listing.businessName}, I just placed an order (${orderSuccess.paymentOption === "PAY_UPFRONT" ? "Paid Upfront via M-Pesa" : "Pay on Delivery"}). My name is ${orderSuccess.orderedByName}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    <MessageCircle size={17} />
                    Chat on WhatsApp
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setOrderSuccess(null)}
                  className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
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
