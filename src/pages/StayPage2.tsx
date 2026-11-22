import {
  useEffect,
  useMemo,
  useState,
  useRef,
  type FormEvent,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
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
  Trash2,
  X,
  AlertTriangle,
  Lock,
  SlidersHorizontal,
  Truck,
  Smartphone,
  Wallet,
  Clock,
  Clipboard,
} from "lucide-react";
import { generatePickupCode } from "../lib/utils/pickupCode";
import InlineLoader, { ButtonLoader } from "../components/shared/InlineLoader";
import PaymentGuidanceCard, {
  DirectPaymentConfig,
  PaymentEvidence,
} from "../components/shared/PaymentGuidanceCard";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

// Universal storefront banner. Add the image at public/store-banner.jpg.
const UNIVERSAL_BANNER_IMAGE = "/store-banner.jpg";

const FONT_LINK_ID = "hlynk-store-fonts-v2";

function useStoreFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;

    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

/* ------------------------------------------------------------------ */
/*  Design tokens                                                      */
/*  ink #14161F · paper #EEF0F6 · ultramarine #2A3BFF · sticker #FFD83D */
/*  coral #FF5A4E · leaf #12A150                                        */
/* ------------------------------------------------------------------ */
const display = {
  fontFamily: "'Bricolage Grotesque', 'Hanken Grotesk', system-ui, sans-serif",
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A3BFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EEF0F6]";

const inputCls =
  "h-12 w-full rounded-xl border border-[#14161F]/20 bg-white px-4 text-sm text-[#14161F] outline-none transition placeholder:text-[#14161F]/35 focus:border-[#2A3BFF] focus:ring-2 focus:ring-[#2A3BFF]/20";

const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#2A3BFF] px-5 py-3 text-sm font-bold text-white shadow-[3px_3px_0_#14161F] transition hover:-translate-y-px hover:shadow-[4px_4px_0_#14161F] active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_#14161F] disabled:cursor-not-allowed disabled:opacity-60";

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
  trackStock?: boolean | number;
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
  logoUrl?: string | null;
  bannerUrl?: string;
  hasMpesaGateway?: boolean;
  directPayment?: DirectPaymentConfig;
  operationalSettings?: any;
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
  description?: string;
}

type ViewMode = "grid" | "list";

function formatPrice(price: number) {
  return `KES ${Number(price || 0).toLocaleString()}`;
}

function formatWhatsAppNumber(phone?: string): string {
  if (!phone) return "";
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (
    cleaned.startsWith("0") &&
    (cleaned.length === 10 || cleaned.length === 9)
  ) {
    cleaned = "254" + cleaned.slice(1);
  }
  return cleaned;
}

function getItemImages(item: Room | Product): string[] {
  if ("meta" in item) {
    if (item.meta?.images?.length) return item.meta.images.filter(Boolean);
    if (item.meta?.imageUrl) return [item.meta.imageUrl];
    return [];
  }
  return item.imageUrl ? [item.imageUrl] : [];
}

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

function GalleryModal({
  images,
  title,
  description,
  onClose,
}: {
  images: string[];
  title: string;
  description?: string;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [images]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (images.length > 1 && e.key === "ArrowRight")
        setIndex((v) => (v + 1) % images.length);
      if (images.length > 1 && e.key === "ArrowLeft")
        setIndex((v) => (v - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length, onClose]);

  if (!images.length && !description) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#14161F]/85 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#14161F]/10 px-4 py-3">
          <h3
            className="truncate text-base font-bold text-[#14161F]"
            style={display}
          >
            {title}
          </h3>
          <div className="flex items-center gap-3">
            {images.length > 1 && (
              <span className="text-xs font-semibold text-[#14161F]/50">
                {index + 1} of {images.length}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className={`grid h-9 w-9 place-items-center rounded-lg bg-[#EEF0F6] text-[#14161F] transition hover:bg-[#FFD83D] ${focusRing}`}
              aria-label="Close gallery"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="relative bg-[#EEF0F6]">
          {images.length > 0 ? (
            <img
              src={images[index]}
              alt={`${title} ${index + 1}`}
              className="mx-auto max-h-[62vh] w-full object-contain"
            />
          ) : (
            <div className="grid h-40 place-items-center text-sm text-[#14161F]/40">
              No photos for this item
            </div>
          )}

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setIndex((v) => (v - 1 + images.length) % images.length)
                }
                className={`absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-xl bg-white text-[#14161F] shadow-[2px_2px_0_#14161F] transition hover:bg-[#FFD83D] ${focusRing}`}
                aria-label="Previous photo"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => setIndex((v) => (v + 1) % images.length)}
                className={`absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-xl bg-white text-[#14161F] shadow-[2px_2px_0_#14161F] transition hover:bg-[#FFD83D] ${focusRing}`}
                aria-label="Next photo"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {description && (
          <div className="custom-scrollbar max-h-[22vh] overflow-y-auto px-4 py-3">
            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[#14161F]/75">
              {description}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#14161F]/25 bg-white/60 px-6 py-16 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#FFD83D] text-[#14161F]">
        <Search size={22} />
      </div>
      <h3 className="mt-4 text-xl font-bold text-[#14161F]" style={display}>
        {query ? "No matches" : "Nothing here yet"}
      </h3>
      <p className="mx-auto mt-1 max-w-xs text-sm text-[#14161F]/55">
        {query
          ? `Nothing matches "${query}". Check the spelling or try a shorter word.`
          : "This category has no items yet. Check back soon."}
      </p>
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
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-[#14161F]/65">
        {label}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
    </label>
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
    <div className="flex min-w-0 items-center gap-3 px-4 py-3.5">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#EEF0F6] text-[#2A3BFF]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-[#14161F]/50">{label}</p>
        <p className="truncate text-[13px] font-bold text-[#14161F]">{value}</p>
      </div>
    </div>
  );
}

function PayTile({
  active,
  onClick,
  icon,
  title,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-col gap-1.5 rounded-xl border-2 p-3 text-left transition ${focusRing} ${
        active
          ? "border-[#2A3BFF] bg-[#2A3BFF]/[0.06] text-[#14161F]"
          : "border-[#14161F]/10 bg-white text-[#14161F]/70 hover:border-[#14161F]/30"
      }`}
    >
      <span className={active ? "text-[#2A3BFF]" : "text-[#14161F]/45"}>
        {icon}
      </span>
      <span className="text-xs font-bold leading-tight">{title}</span>
      <span className="text-[11px] leading-tight text-[#14161F]/50">{sub}</span>
    </button>
  );
}

function Notice({
  tone,
  icon,
  title,
  children,
}: {
  tone: "green" | "amber" | "red" | "slate";
  icon: ReactNode;
  title: string;
  children?: ReactNode;
}) {
  const tones = {
    green: "border-[#12A150]/30 bg-[#12A150]/10 text-[#0b5e30]",
    amber: "border-[#E0A800]/40 bg-[#FFD83D]/25 text-[#5c4500]",
    red: "border-[#FF5A4E]/40 bg-[#FF5A4E]/10 text-[#8f1f17]",
    slate: "border-[#14161F]/10 bg-[#EEF0F6] text-[#14161F]/80",
  } as const;
  return (
    <div
      className={`rounded-xl border p-3.5 text-left text-xs leading-relaxed ${tones[tone]}`}
    >
      <div className="flex items-center gap-2 text-[13px] font-bold">
        {icon}
        <span>{title}</span>
      </div>
      {children && <div className="mt-1.5 space-y-1.5">{children}</div>}
    </div>
  );
}

function CatalogCard({
  item,
  images = [],
  image,
  onImageClick,
  onAdd,
  ctaLabel,
  isList,
}: {
  item: Room | Product;
  images?: string[];
  image?: string;
  imageCount: number;
  onImageClick: () => void;
  onAdd: () => void;
  ctaLabel: string;
  isList: boolean;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isRoom = "title" in item;
  const title = isRoom ? item.title : item.name;
  const category = isRoom ? item.type : item.category || "General";
  const description = isRoom ? item.meta?.description : item.description;
  const price = isRoom ? Number(item.basePrice) : Number(item.price);
  const fallback = isRoom ? <BedDouble size={26} /> : <Package size={26} />;

  const allImgs = images.length > 0 ? images : image ? [image] : [];
  const activeImg = allImgs[currentIndex] || allImgs[0];

  // Untracked products are always available; tracked products at 0 are out of stock.
  const isTracked =
    "trackStock" in item ? Boolean((item as any).trackStock) : false;
  const stockLevel = "stockLevel" in item ? Number(item.stockLevel) : null;
  const isOutOfStock = isTracked && stockLevel !== null && stockLevel <= 0;
  const isLowStock =
    isTracked && stockLevel !== null && stockLevel > 0 && stockLevel <= 5;
  const addTitle = isOutOfStock
    ? "This item may be out of stock. You can still place an order."
    : undefined;

  const prevImg = (e: ReactMouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex((prev) => (prev === 0 ? allImgs.length - 1 : prev - 1));
  };
  const nextImg = (e: ReactMouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex((prev) => (prev === allImgs.length - 1 ? 0 : prev + 1));
  };

  const stockBadge = isOutOfStock ? (
    <span className="rounded-md bg-[#FF5A4E] px-1.5 py-0.5 text-[11px] font-bold text-white">
      Sold out
    </span>
  ) : isLowStock ? (
    <span className="rounded-md bg-[#14161F] px-1.5 py-0.5 text-[11px] font-bold text-[#FFD83D]">
      {stockLevel} left
    </span>
  ) : null;

  const addBtnCls = `inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-bold text-white transition active:scale-95 ${focusRing} ${
    isOutOfStock
      ? "bg-[#14161F]/45 hover:bg-[#14161F]/60"
      : "bg-[#2A3BFF] hover:bg-[#1c2be0]"
  }`;

  if (isList) {
    return (
      <article className="flex w-full items-stretch overflow-hidden rounded-xl border border-[#14161F]/10 bg-white transition hover:border-[#14161F]/30">
        <button
          type="button"
          disabled={!activeImg && !description}
          onClick={onImageClick}
          className="relative h-[84px] w-[84px] shrink-0 overflow-hidden bg-[#EEF0F6] disabled:cursor-default sm:h-24 sm:w-24"
          aria-label={
            activeImg
              ? `View photos of ${title}`
              : description
                ? `View details of ${title}`
                : undefined
          }
        >
          {activeImg ? (
            <img
              src={activeImg}
              alt={title}
              className={`h-full w-full object-cover ${isOutOfStock ? "grayscale" : ""}`}
            />
          ) : (
            <div className="grid h-full place-items-center text-[#14161F]/30">
              {fallback}
            </div>
          )}
          {allImgs.length > 1 && (
            <span className="absolute bottom-1 right-1 rounded bg-[#14161F] px-1 text-[10px] font-bold text-white">
              +{allImgs.length - 1}
            </span>
          )}
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-bold text-[#14161F]">
              {title}
            </h3>
            <p className="mt-0.5 truncate text-xs text-[#14161F]/50">
              {category}
              {description ? `, ${description}` : ""}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm font-extrabold text-[#14161F]" style={display}>
                {isRoom && (
                  <span className="mr-1 text-[11px] font-semibold text-[#14161F]/50">
                    from
                  </span>
                )}
                {formatPrice(price)}
              </span>
              {stockBadge}
            </div>
          </div>
          <button
            type="button"
            onClick={onAdd}
            title={addTitle}
            aria-label={`${ctaLabel} ${title}`}
            className={addBtnCls}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">{ctaLabel}</span>
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="group/card flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#14161F]/10 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-[#14161F] hover:shadow-[4px_4px_0_#14161F]">
      <div
        className="group/slider relative aspect-[4/3] w-full cursor-pointer overflow-hidden bg-[#EEF0F6]"
        onClick={onImageClick}
      >
        {activeImg ? (
          <img
            src={activeImg}
            alt={title}
            className={`h-full w-full object-cover transition duration-500 group-hover/card:scale-[1.04] ${isOutOfStock ? "grayscale" : ""}`}
          />
        ) : (
          <div className="grid h-full place-items-center text-[#14161F]/30">
            {fallback}
          </div>
        )}

        <span className="absolute bottom-2.5 left-2.5 z-10 -rotate-3 rounded-md bg-[#FFD83D] px-2 py-1 text-[13px] font-extrabold leading-none text-[#14161F] shadow-[2px_2px_0_#14161F]" style={display}>
          {isRoom && (
            <span className="mr-1 text-[10px] font-semibold opacity-60">from</span>
          )}
          {formatPrice(price)}
        </span>

        {stockBadge && <div className="absolute right-2.5 top-2.5 z-10">{stockBadge}</div>}

        {allImgs.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImg}
              className="absolute left-2 top-1/2 z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg bg-white text-[#14161F] opacity-0 shadow transition-opacity focus-visible:opacity-100 group-hover/slider:opacity-100"
              aria-label="Previous photo"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={nextImg}
              className="absolute right-2 top-1/2 z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg bg-white text-[#14161F] opacity-0 shadow transition-opacity focus-visible:opacity-100 group-hover/slider:opacity-100"
              aria-label="Next photo"
            >
              <ChevronRight size={16} />
            </button>
            <div className="absolute bottom-3 right-2.5 z-20 flex items-center gap-1">
              {allImgs.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setCurrentIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentIndex
                      ? "w-4 bg-white"
                      : "w-1.5 bg-white/60 hover:bg-white"
                  }`}
                  aria-label={`Photo ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-[#14161F]">{title}</h3>
          <p className="mt-0.5 truncate text-xs text-[#14161F]/50">
            {category}
          </p>
          {description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[#14161F]/65">
              {description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onAdd}
          title={addTitle}
          className={`${addBtnCls} mt-auto w-full`}
        >
          <Plus size={15} />
          {isOutOfStock ? "Order anyway" : ctaLabel}
        </button>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function StoreFront({ isShopMode }: { isShopMode?: boolean }) {
  useStoreFonts();
  const reduceMotion = useReducedMotion();

  const { slug } = useParams<{ slug: string }>();
  const isShopPath =
    isShopMode ||
    (typeof window !== "undefined" &&
      (window.location.pathname.startsWith("/shop") ||
        window.location.pathname.startsWith("/store")));

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"rooms" | "products">(
    isShopPath ? "products" : "rooms",
  );
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [savedOrderPass, setSavedOrderPass] = useState<any>(() => {
    try {
      const stored = localStorage.getItem(`hlynk_order_pass_${slug}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        // keep for 24 hours
        if (Date.now() - (parsed.savedAt || 0) < 24 * 60 * 60 * 1000) {
          return parsed;
        }
      }
    } catch (_) {}
    return null;
  });

  const [gallery, setGallery] = useState<GalleryState | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const [paymentOption, setPaymentOption] = useState<
    "DIRECT_PAYMENT" | "PAY_UPFRONT" | "PAY_ON_DELIVERY"
  >("DIRECT_PAYMENT");
  const [paymentEvidence, setPaymentEvidence] = useState<PaymentEvidence>({
    transactionCode: "",
  });
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [stkStatus, setStkStatus] = useState<
    "IDLE" | "SENDING" | "SENT" | "FAILED"
  >("IDLE");
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(
    null,
  );
  const checkoutRef = useMemo(
    () => `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    [],
  );

  const hasDirectPayment = Boolean(
    listing?.directPayment &&
    listing.directPayment.enabled !== false &&
    listing.directPayment.businessNumber &&
    listing.directPayment.businessNumber.trim().length > 0,
  );

  const effectiveDirectPayment: DirectPaymentConfig | null = useMemo(() => {
    if (hasDirectPayment && listing?.directPayment) {
      return listing.directPayment;
    }
    return null;
  }, [listing, hasDirectPayment]);

  useEffect(() => {
    if (listing) {
      if (hasDirectPayment) {
        setPaymentOption("DIRECT_PAYMENT");
      } else if (listing.hasMpesaGateway) {
        setPaymentOption("PAY_UPFRONT");
      } else {
        setPaymentOption("PAY_ON_DELIVERY");
      }
    }
  }, [listing, hasDirectPayment]);

  const handleUploadReceipt = async (file: File): Promise<string | null> => {
    setUploadingReceipt(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(
        `${API_URL}/api/v1/public/receipt`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      if (res.data.success && res.data.data?.url) {
        toast.success("Receipt screenshot attached");
        return res.data.data.url;
      }
      return null;
    } catch (err: any) {
      console.warn("Receipt upload fallback to local preview");
      return null;
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleInitiateStkPush = async (): Promise<string | null> => {
    const phoneToUse = mpesaPhone.trim() || customerPhone.trim();
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
      toast.error(
        err.response?.data?.message || "Failed to send M-Pesa prompt",
      );
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

    if (
      paymentOption === "DIRECT_PAYMENT" &&
      !paymentEvidence.transactionCode.trim()
    ) {
      toast.error(
        "Please enter your M-Pesa transaction code from the SMS receipt to confirm order.",
      );
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

      const backendPaymentOption =
        paymentOption === "DIRECT_PAYMENT" ? "PAY_DIRECT" : paymentOption;
      const backendPaymentEvidence =
        paymentOption === "DIRECT_PAYMENT"
          ? {
              ...paymentEvidence,
              paidAmount: totalCartAmount,
              methodType: effectiveDirectPayment?.methodType || "MPESA_PAYBILL",
            }
          : undefined;

      const response = await axios.post(`${API_URL}/api/v1/public/order`, {
        slug,
        customerName,
        customerPhone,
        deliveryAddress,
        notes,
        items: cart,
        paymentOption: backendPaymentOption,
        paymentEvidence: backendPaymentEvidence,
        checkoutRequestId: activeReqId,
      });

      const serverData = response.data?.data || {};
      const isAutoVerified =
        serverData.paymentStatus === "PAID" || serverData.verified === true;

      const assignedPickupCode =
        serverData.pickupCode ||
        generatePickupCode(serverData.orderId || serverData.saleId);
      const fullOrderData = {
        ...serverData,
        pickupCode: assignedPickupCode,
        orderedByName: customerName,
        paymentOption: backendPaymentOption,
        paymentEvidence: backendPaymentEvidence,
        transactionCode:
          paymentOption === "DIRECT_PAYMENT"
            ? paymentEvidence.transactionCode || serverData.transactionCode
            : null,
        paymentStatus:
          paymentOption === "DIRECT_PAYMENT"
            ? isAutoVerified
              ? "PAID"
              : "AWAITING_VERIFICATION"
            : paymentOption === "PAY_UPFRONT"
              ? "PENDING_STK"
              : "PAY_ON_DELIVERY",
        mpesaReceipt:
          paymentEvidence.transactionCode || serverData.transactionCode || null,
      };

      setOrderSuccess(fullOrderData);
      try {
        const passToSave = {
          ...fullOrderData,
          savedAt: Date.now(),
          businessName: listing?.businessName,
        };
        localStorage.setItem(
          `hlynk_order_pass_${slug}`,
          JSON.stringify(passToSave),
        );
        setSavedOrderPass(passToSave);
      } catch (_) {}

      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setDeliveryAddress("");
      setNotes("");
      setMpesaPhone("");
      setPaymentEvidence({ transactionCode: "" });
      setCheckoutRequestId(null);
      setStkStatus("IDLE");
      setIsOrdering(false);
      setIsCartOpen(false);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Failed to submit order. Please try again.",
      );
    } finally {
      setSubmittingOrder(false);
    }
  };

  useEffect(() => {
    if (!orderSuccess?.saleId || orderSuccess.paymentOption !== "PAY_UPFRONT")
      return;
    if (
      orderSuccess.paymentStatus === "PAID" ||
      orderSuccess.paymentStatus === "CANCELLED" ||
      orderSuccess.paymentStatus === "FAILED" ||
      orderSuccess.paymentStatus === "TIMED_OUT"
    )
      return;

    let pollAttempts = 0;
    const maxPolls = 12; // 12 polls * 3s = 36 seconds maximum spinning

    const interval = setInterval(async () => {
      pollAttempts++;
      try {
        const res = await axios.get(
          `${API_URL}/api/v1/public/order-status/${orderSuccess.saleId}`,
        );
        if (res.data.success && res.data.data) {
          const { status, statusLabel, mpesaReceipt } = res.data.data;
          if (status === 0 || statusLabel === "PAID") {
            setOrderSuccess((prev: any) =>
              prev ? { ...prev, paymentStatus: "PAID", mpesaReceipt } : null,
            );
            toast.success(`M-Pesa payment received! Receipt: ${mpesaReceipt}`);
            clearInterval(interval);
            return;
          } else if (
            status === 3 ||
            statusLabel === "CANCELLED" ||
            status === 4 ||
            statusLabel === "FAILED"
          ) {
            setOrderSuccess((prev: any) =>
              prev ? { ...prev, paymentStatus: "CANCELLED" } : null,
            );
            toast.error("M-Pesa payment was cancelled or failed.");
            clearInterval(interval);
            return;
          }
        }
      } catch (e) {
        // ignore polling errors silently
      }

      if (pollAttempts >= maxPolls) {
        clearInterval(interval);
        setOrderSuccess((prev: any) =>
          prev && prev.paymentStatus === "PENDING_STK"
            ? { ...prev, paymentStatus: "TIMED_OUT" }
            : prev,
        );
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [
    orderSuccess?.saleId,
    orderSuccess?.paymentOption,
    orderSuccess?.paymentStatus,
  ]);

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
            : entry,
        );
      }

      return [...current, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (id: string) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const totalCartAmount = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart],
  );

  const cartItemCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  );

  // Show header when scrolling upward; hide it when scrolling down.
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    let ticking = false;
    const threshold = 6;

    const getScrollY = () =>
      Math.max(
        0,
        window.scrollY ||
          window.pageYOffset ||
          document.documentElement.scrollTop ||
          document.body.scrollTop ||
          0,
      );

    lastScrollYRef.current = getScrollY();

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const currentY = getScrollY();
        const diff = currentY - lastScrollYRef.current;

        if (currentY <= 40) {
          setHeaderVisible(true);
          lastScrollYRef.current = currentY;
        } else if (diff > threshold) {
          setHeaderVisible(false);
          lastScrollYRef.current = currentY;
        } else if (diff < -threshold) {
          setHeaderVisible(true);
          lastScrollYRef.current = currentY;
        }

        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#EEF0F6]">
        <InlineLoader
          size="lg"
          message="Opening the store..."
          color="text-[#2A3BFF]"
        />
      </div>
    );
  }

  if (error || !listing) {
    const isLockedError =
      error?.toLowerCase().includes("business pro") ||
      error?.toLowerCase().includes("trial");

    return (
      <div
        className="grid min-h-screen place-items-center bg-[#EEF0F6] p-5"
        style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}
      >
        <div className="w-full max-w-md rounded-3xl border border-[#14161F] bg-white p-7 shadow-[6px_6px_0_#14161F]">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#FFD83D] text-[#14161F]">
            {isLockedError ? <Lock size={25} /> : <AlertTriangle size={25} />}
          </div>

          <h1 className="mt-5 text-3xl font-extrabold leading-tight text-[#14161F]" style={display}>
            {isLockedError
              ? "This store needs a Business Pro plan"
              : "We can't open this store"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#14161F]/65">
            {error || "This store or listing does not exist. Check the link and try again."}
          </p>

          <div className="mt-6 grid gap-2.5">
            {isLockedError && (
              <a href="/login" className={primaryBtn}>
                Log in and upgrade
              </a>
            )}
            <a
              href="/"
              className="rounded-xl border border-[#14161F]/20 px-5 py-3 text-center text-sm font-bold text-[#14161F] transition hover:bg-[#EEF0F6]"
            >
              Back to hlynk
            </a>
          </div>
        </div>
      </div>
    );
  }

  const allRooms = listing.rooms || [];
  const allProducts = listing.products || [];

  const roomTypes = [
    ...new Set(allRooms.map((room) => room.type).filter(Boolean)),
  ];
  const productCategories = [
    ...new Set(
      allProducts
        .map((product) => product.category || "General")
        .filter(Boolean),
    ),
  ];

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredRooms = allRooms
    .filter((room) => filter === "all" || room.type === filter)
    .filter(
      (room) =>
        !normalizedQuery ||
        room.title.toLowerCase().includes(normalizedQuery) ||
        room.type.toLowerCase().includes(normalizedQuery),
    );

  const filteredProducts = allProducts
    .filter(
      (product) =>
        categoryFilter === "all" ||
        (product.category || "General") === categoryFilter,
    )
    .filter(
      (product) =>
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        (product.category || "").toLowerCase().includes(normalizedQuery),
    );

  const activeItems =
    activeTab === "rooms" && allRooms.length ? allRooms : allProducts;

  const activeCategories =
    activeTab === "rooms" ? roomTypes : productCategories;

  const setActiveCategory = (value: string) => {
    if (activeTab === "rooms") setFilter(value);
    else setCategoryFilter(value);
  };

  const currentFilter = activeTab === "rooms" ? filter : categoryFilter;

  const sectionTitle = activeTab === "rooms" ? "Pick a space" : "Shop the store";

  const sectionSubtitle =
    activeTab === "rooms"
      ? "Choose the room that fits your visit, then book it."
      : "Add what you want to your cart and order directly.";

  const activeLogo =
    listing.logoUrl || listing.operationalSettings?.logoUrl || "/fav.png";

  const gridCls =
    viewMode === "grid"
      ? "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5"
      : "grid gap-2.5";

  const waCode = orderSuccess
    ? orderSuccess.pickupCode || generatePickupCode(orderSuccess.saleId)
    : "";

  const reveal = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] as any },
        };

  return (
    <div
      className="relative min-h-screen overflow-x-clip bg-[#EEF0F6] pb-28 text-[#14161F] selection:bg-[#FFD83D] selection:text-[#14161F]"
      style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}
    >
      {/* HEADER */}
      <motion.header
        initial={false}
        animate={{
          y: headerVisible ? 0 : "-100%",
          opacity: headerVisible ? 1 : 0,
        }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-[70] border-b border-[#14161F]/10 bg-[#EEF0F6]/90 backdrop-blur-md will-change-transform"
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          pointerEvents: headerVisible ? "auto" : "none",
        }}
      >
        <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <a
            href="#top"
            className={`flex min-w-0 items-center gap-3 rounded-lg ${focusRing}`}
            aria-label={listing.businessName || "Home"}
          >
            <img
              src={activeLogo}
              alt=""
              className={`h-10 w-10 shrink-0 bg-white object-contain ${
                activeLogo !== "/fav.png" ? "rounded-xl" : "rounded-xl p-1"
              }`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/fav.png";
              }}
            />
            <span
              className="hidden truncate text-lg font-extrabold tracking-tight sm:block"
              style={display}
            >
              {listing.businessName}
            </span>
          </a>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Sections">
            {[
              { href: "#catalog", label: "Shop" },
              { href: "#featured", label: "Featured" },
              ...(listing.phone ? [{ href: "#contact", label: "Contact" }] : []),
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold text-[#14161F]/70 transition hover:bg-white hover:text-[#14161F] ${focusRing}`}
              >
                {label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className={`relative inline-flex h-11 items-center gap-2 rounded-xl bg-[#14161F] px-4 text-sm font-bold text-white transition hover:bg-[#2A3BFF] active:scale-95 ${focusRing}`}
          >
            <ShoppingBag size={17} />
            <span className="hidden sm:inline">Cart</span>
            {cartItemCount > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-md bg-[#FFD83D] px-1 text-[11px] font-extrabold text-[#14161F]">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </motion.header>

      <main id="top" className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
        {/* HERO: the shop sign */}
        <section className="mt-3 overflow-hidden rounded-[28px] bg-[#2A3BFF] text-white">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col justify-end p-6 sm:p-10 lg:p-12">
              <motion.h1
                {...reveal(0)}
                className="text-[clamp(2.6rem,8vw,5.75rem)] font-extrabold leading-[0.95] tracking-[-0.03em]"
                style={display}
              >
                {listing.businessName}
              </motion.h1>

              <motion.p
                {...reveal(0.12)}
                className="mt-5 max-w-md text-base leading-7 text-white/80"
              >
                Pick what you need, pay your way, and the business gets your
                order straight away.
              </motion.p>

              <motion.div {...reveal(0.22)} className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#catalog"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FFD83D] px-5 py-3 text-sm font-extrabold text-[#14161F] shadow-[3px_3px_0_#14161F] transition hover:-translate-y-px hover:shadow-[4px_4px_0_#14161F] active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_#14161F]"
                >
                  Start shopping
                  <ChevronRight size={16} />
                </a>
                {listing.phone && (
                  <a
                    href={`tel:${listing.phone}`}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    <Phone size={15} />
                    Call us
                  </a>
                )}
              </motion.div>
            </div>

            <div className="relative min-h-[220px] lg:min-h-[420px]">
              <div className="absolute inset-4 overflow-hidden rounded-[22px] bg-[#1c2be0] lg:left-0 lg:rotate-[2deg]">
                <img
                  src={listing.bannerUrl || UNIVERSAL_BANNER_IMAGE}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 divide-y divide-[#14161F]/10 bg-white text-[#14161F] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            <InfoCell
              icon={<ShoppingBag size={17} />}
              label="In the collection"
              value={`${activeItems.length} item${activeItems.length === 1 ? "" : "s"}`}
            />
            <InfoCell
              icon={<CheckCircle2 size={17} />}
              label="How to order"
              value="Order directly online"
            />
            <InfoCell
              icon={<MapPin size={17} />}
              label="Find us"
              value={listing.location || "Ask the business"}
            />
            <InfoCell
              icon={<Phone size={17} />}
              label="Call or WhatsApp"
              value={listing.phone || "Ask the business"}
            />
          </div>
        </section>

        {/* CATALOG */}
        <section id="catalog" className="mt-12 scroll-mt-24">
          {allRooms.length > 0 && allProducts.length > 0 && (
            <div
              className="mb-6 inline-flex rounded-xl bg-white p-1 shadow-sm"
              role="tablist"
            >
              {(
                [
                  { id: "rooms", label: "Stays", icon: <BedDouble size={16} /> },
                  { id: "products", label: "Products", icon: <Package size={16} /> },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => switchTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${focusRing} ${
                    activeTab === tab.id
                      ? "bg-[#14161F] text-white"
                      : "text-[#14161F]/55 hover:text-[#14161F]"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h2
                className="text-4xl font-extrabold tracking-[-0.02em] sm:text-5xl"
                style={display}
              >
                {sectionTitle}
              </h2>
              <p className="mt-2 text-sm text-[#14161F]/60">{sectionSubtitle}</p>
            </div>

            <div className="flex w-full items-center gap-2 lg:max-w-[480px]">
              <div className="relative min-w-0 flex-1">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#14161F]/40"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={
                    activeTab === "rooms" ? "Search rooms" : "Search products"
                  }
                  className="h-12 w-full rounded-xl border border-[#14161F]/15 bg-white pl-11 pr-10 text-sm outline-none transition placeholder:text-[#14161F]/40 focus:border-[#2A3BFF] focus:ring-2 focus:ring-[#2A3BFF]/20"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#14161F]/40 hover:text-[#14161F]"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="flex h-12 items-center rounded-xl bg-white p-1 shadow-sm">
                {(
                  [
                    { id: "grid", label: "Grid view", icon: <LayoutGrid size={17} /> },
                    { id: "list", label: "List view", icon: <List size={17} /> },
                  ] as const
                ).map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setViewMode(v.id)}
                    aria-label={v.label}
                    aria-pressed={viewMode === v.id}
                    className={`grid h-10 w-10 place-items-center rounded-lg transition ${focusRing} ${
                      viewMode === v.id
                        ? "bg-[#14161F] text-white"
                        : "text-[#14161F]/45 hover:text-[#14161F]"
                    }`}
                  >
                    {v.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {activeCategories.length > 1 && (
            <div className="no-scrollbar -mx-4 mt-6 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
              <SlidersHorizontal
                size={15}
                className="mr-1 shrink-0 text-[#14161F]/40"
                aria-hidden
              />
              {["all", ...activeCategories].map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={currentFilter === category}
                  className={`whitespace-nowrap rounded-lg border px-3.5 py-2 text-[13px] font-bold transition active:scale-95 ${focusRing} ${
                    currentFilter === category
                      ? "border-[#14161F] bg-[#14161F] text-white"
                      : "border-[#14161F]/15 bg-white text-[#14161F]/70 hover:border-[#14161F]/40"
                  }`}
                >
                  {category === "all" ? "All" : category}
                </button>
              ))}
            </div>
          )}

          <div id="featured" className="mt-6 scroll-mt-24">
            {activeTab === "rooms" &&
              allRooms.length > 0 &&
              (filteredRooms.length ? (
                <div className={gridCls}>
                  {filteredRooms.map((room) => {
                    const images = getItemImages(room);
                    return (
                      <CatalogCard
                        key={room.id}
                        item={room}
                        images={images}
                        image={images[0]}
                        imageCount={images.length}
                        onImageClick={() =>
                          (images.length || room.meta?.description) &&
                          setGallery({
                            images,
                            title: room.title,
                            description: room.meta?.description,
                          })
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
              ))}

            {(activeTab === "products" || allRooms.length === 0) &&
              allProducts.length > 0 &&
              (filteredProducts.length ? (
                <div className={gridCls}>
                  {filteredProducts.map((product) => {
                    const images = getItemImages(product);
                    return (
                      <CatalogCard
                        key={product.id}
                        item={product}
                        images={images}
                        image={images[0]}
                        imageCount={images.length}
                        onImageClick={() =>
                          (images.length || product.description) &&
                          setGallery({
                            images,
                            title: product.name,
                            description: product.description,
                          })
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

            {!allRooms.length && !allProducts.length && <EmptyState query="" />}
          </div>
        </section>

        {/* CONTACT */}
        <section
          id="contact"
          className="mt-16 overflow-hidden rounded-[28px] bg-[#14161F] text-white"
        >
          <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
            <div className="p-7 sm:p-10">
              <h2
                className="max-w-xl text-3xl font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-5xl"
                style={display}
              >
                Got a question before you order?
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/65">
                Ask {listing.businessName} about stock, delivery or timing.
                They reply on the number below.
              </p>

              {listing.phone && (
                <div className="mt-7 flex flex-wrap gap-3">
                  <a
                    href={`tel:${listing.phone.replace(/[^0-9+\-()\s]/g, "")}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FFD83D] px-5 py-3 text-sm font-extrabold text-[#14161F] transition hover:bg-white"
                  >
                    <Phone size={16} />
                    Call the business
                  </a>
                  <a
                    href={`https://wa.me/${formatWhatsAppNumber(listing.phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-white/25 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    <MessageCircle size={16} />
                    Message on WhatsApp
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-end border-t border-white/10 bg-white/[0.04] p-7 sm:p-10 lg:border-l lg:border-t-0">
              <div>
                <p className="text-sm leading-7 text-white/70">
                  Your order goes straight to the business. They will follow up
                  using the phone number you give at checkout.
                </p>
                <p className="mt-4 text-sm font-semibold text-white">
                  Powered by{" "}
                  <a
                    href="https://hlynk.co.ke"
                    className="text-[#FFD83D] underline-offset-4 hover:underline"
                  >
                    hlynk
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* CART BAR */}
      <AnimatePresence>
        {cart.length > 0 && !isCartOpen && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            <button
              type="button"
              onClick={() => {
                setIsCartOpen(true);
                setIsOrdering(true);
              }}
              className={`flex w-full items-center justify-between gap-3 rounded-2xl bg-[#14161F] p-2.5 pl-4 text-left text-white shadow-[4px_4px_0_#2A3BFF] transition active:translate-x-px active:translate-y-px ${focusRing}`}
            >
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-white/55">
                  {cartItemCount} item{cartItemCount === 1 ? "" : "s"} in your cart
                </span>
                <span
                  className="block truncate text-lg font-extrabold"
                  style={display}
                >
                  {formatPrice(totalCartAmount)}
                </span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#FFD83D] px-4 py-3 text-sm font-extrabold text-[#14161F]">
                Check out
                <ChevronRight size={16} />
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
            className="fixed inset-0 z-[80] flex items-end justify-center bg-[#14161F]/60 sm:items-stretch sm:justify-end"
            role="presentation"
          >
            <motion.aside
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Your cart"
              className="flex h-[92dvh] w-full max-w-[520px] flex-col overflow-hidden rounded-t-[28px] bg-[#EEF0F6] text-[#14161F] sm:h-full sm:rounded-none"
            >
              <div
                className="flex items-center justify-between px-5 pb-4 sm:px-7"
                style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top, 0px))" }}
              >
                <div>
                  <h2
                    className="text-3xl font-extrabold tracking-[-0.02em]"
                    style={display}
                  >
                    {isOrdering ? "Checkout" : "Your cart"}
                  </h2>
                  {cart.length > 0 && (
                    <p className="mt-0.5 text-xs font-semibold text-[#14161F]/55">
                      {cartItemCount} item{cartItemCount === 1 ? "" : "s"}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className={`grid h-11 w-11 place-items-center rounded-xl bg-white text-[#14161F] transition hover:bg-[#FFD83D] active:scale-95 ${focusRing}`}
                  aria-label="Close cart"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-8 sm:px-7">
                {!cart.length ? (
                  <div className="grid min-h-[50vh] place-items-center text-center">
                    <div>
                      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white text-[#2A3BFF]">
                        <ShoppingBag size={26} />
                      </div>
                      <h3
                        className="mt-4 text-xl font-bold"
                        style={display}
                      >
                        Your cart is empty
                      </h3>
                      <p className="mx-auto mt-1 max-w-[16rem] text-sm text-[#14161F]/55">
                        Tap Add on anything in the store and it will show up here.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsCartOpen(false)}
                        className={`${primaryBtn} mt-5`}
                      >
                        Back to the store
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Receipt-style item list */}
                    <div className="rounded-2xl bg-white p-4">
                      <ul className="divide-y divide-dashed divide-[#14161F]/20">
                        {cart.map((item) => (
                          <li key={item.id} className="flex gap-3 py-3 first:pt-0">
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#EEF0F6]">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="grid h-full place-items-center text-[#14161F]/30">
                                  <Package size={20} />
                                </div>
                              )}
                            </div>

                            <div className="flex min-w-0 flex-1 flex-col">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-[#14161F]/55">
                                    {formatPrice(item.price)} each
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(item.id)}
                                  className="p-1 text-[#14161F]/35 transition hover:text-[#FF5A4E]"
                                  aria-label={`Remove ${item.name}`}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>

                              <div className="mt-auto flex items-center justify-between pt-1.5">
                                <div className="flex items-center rounded-lg border border-[#14161F]/15">
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, -1)}
                                    className="grid h-8 w-8 place-items-center text-[#14161F]/70 hover:text-[#2A3BFF]"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className="w-7 text-center text-sm font-bold">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, 1)}
                                    className="grid h-8 w-8 place-items-center text-[#14161F]/70 hover:text-[#2A3BFF]"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                                <span className="text-sm font-extrabold" style={display}>
                                  {formatPrice(item.price * item.quantity)}
                                </span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-1 flex items-center justify-between border-t-2 border-dashed border-[#14161F]/25 pt-3">
                        <span className="text-sm font-semibold text-[#14161F]/60">
                          Subtotal
                        </span>
                        <span className="text-lg font-extrabold" style={display}>
                          {formatPrice(totalCartAmount)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5">
                      {!isOrdering ? (
                        <button
                          type="button"
                          onClick={() => setIsOrdering(true)}
                          className={`${primaryBtn} w-full py-4`}
                        >
                          Continue to checkout
                          <ChevronRight size={16} />
                        </button>
                      ) : (
                        <form onSubmit={handleOrderSubmit} className="space-y-5">
                          <fieldset className="grid gap-4 rounded-2xl bg-white p-4">
                            <legend className="sr-only">Your details</legend>
                            <Field
                              label="Full name"
                              value={customerName}
                              onChange={setCustomerName}
                              placeholder="e.g. John Doe"
                              required
                            />
                            <Field
                              label="Phone number"
                              value={customerPhone}
                              onChange={setCustomerPhone}
                              placeholder="e.g. 0712345678"
                              type="tel"
                              required
                            />
                            <Field
                              label="Delivery address (optional)"
                              value={deliveryAddress}
                              onChange={setDeliveryAddress}
                              placeholder="e.g. Westlands, Nairobi"
                            />
                            <label className="block">
                              <span className="mb-1.5 block text-xs font-bold text-[#14161F]/65">
                                Notes for the business (optional)
                              </span>
                              <textarea
                                rows={2}
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                placeholder="Size, colour, arrival time..."
                                className="w-full resize-none rounded-xl border border-[#14161F]/20 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#14161F]/35 focus:border-[#2A3BFF] focus:ring-2 focus:ring-[#2A3BFF]/20"
                              />
                            </label>
                          </fieldset>

                          {/* Payment method */}
                          <div>
                            <p className="mb-2 text-sm font-bold">How do you want to pay?</p>
                            {(() => {
                              const count =
                                (hasDirectPayment ? 1 : 0) +
                                1 +
                                (listing?.hasMpesaGateway ? 1 : 0);
                              const gridCols =
                                count === 3
                                  ? "grid-cols-3"
                                  : count === 2
                                    ? "grid-cols-2"
                                    : "grid-cols-1";
                              return (
                                <div className={`grid gap-2 ${gridCols}`}>
                                  {hasDirectPayment && effectiveDirectPayment && (
                                    <PayTile
                                      active={paymentOption === "DIRECT_PAYMENT"}
                                      onClick={() => {
                                        setPaymentOption("DIRECT_PAYMENT");
                                        setStkStatus("IDLE");
                                        setCheckoutRequestId(null);
                                      }}
                                      icon={<Wallet size={18} />}
                                      title="Pay directly"
                                      sub="Guided M-Pesa payment"
                                    />
                                  )}
                                  <PayTile
                                    active={paymentOption === "PAY_ON_DELIVERY"}
                                    onClick={() => {
                                      setPaymentOption("PAY_ON_DELIVERY");
                                      setStkStatus("IDLE");
                                      setCheckoutRequestId(null);
                                    }}
                                    icon={<Truck size={18} />}
                                    title="Pay on delivery"
                                    sub="Pay when you collect"
                                  />
                                  {listing?.hasMpesaGateway && (
                                    <PayTile
                                      active={paymentOption === "PAY_UPFRONT"}
                                      onClick={() => setPaymentOption("PAY_UPFRONT")}
                                      icon={<Smartphone size={18} />}
                                      title="M-Pesa prompt"
                                      sub="PIN prompt on your phone"
                                    />
                                  )}
                                </div>
                              );
                            })()}
                          </div>

                          {paymentOption === "DIRECT_PAYMENT" &&
                            effectiveDirectPayment && (
                              <PaymentGuidanceCard
                                directPayment={effectiveDirectPayment}
                                amount={totalCartAmount}
                                orderReference={checkoutRef}
                                businessName={listing?.businessName}
                                isInteractive={true}
                                evidence={paymentEvidence}
                                onEvidenceChange={setPaymentEvidence}
                                onUploadReceipt={handleUploadReceipt}
                                uploadingReceipt={uploadingReceipt}
                              />
                            )}

                          {paymentOption === "PAY_UPFRONT" && (
                            <div className="space-y-3 rounded-2xl bg-white p-4">
                              <Field
                                label="M-Pesa phone number"
                                value={mpesaPhone || customerPhone}
                                onChange={setMpesaPhone}
                                placeholder="e.g. 0712345678"
                                type="tel"
                              />
                              {stkStatus === "SENT" ? (
                                <Notice
                                  tone="green"
                                  icon={<CheckCircle2 size={16} />}
                                  title="Prompt sent"
                                >
                                  <p>
                                    Check <strong>{mpesaPhone || customerPhone}</strong> and
                                    enter your M-Pesa PIN to pay.
                                  </p>
                                </Notice>
                              ) : (
                                <Notice
                                  tone="slate"
                                  icon={<Smartphone size={16} />}
                                  title="What happens next"
                                >
                                  <p>
                                    We will send an M-Pesa PIN prompt to{" "}
                                    <strong>
                                      {mpesaPhone || customerPhone || "your phone"}
                                    </strong>{" "}
                                    when you place the order.
                                  </p>
                                </Notice>
                              )}
                            </div>
                          )}

                          {/* Total + submit */}
                          <div className="rounded-2xl bg-[#14161F] p-5 text-white">
                            <div className="flex items-baseline justify-between">
                              <span className="text-sm font-semibold text-white/60">
                                Total to pay
                              </span>
                              <span
                                className="text-3xl font-extrabold text-[#FFD83D]"
                                style={display}
                              >
                                {formatPrice(totalCartAmount)}
                              </span>
                            </div>

                            <button
                              type="submit"
                              disabled={submittingOrder}
                              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFD83D] px-5 py-3.5 text-sm font-extrabold text-[#14161F] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {submittingOrder ? (
                                <>
                                  <ButtonLoader size={16} />
                                  {paymentOption === "PAY_UPFRONT"
                                    ? "Sending M-Pesa prompt..."
                                    : "Placing your order..."}
                                </>
                              ) : paymentOption === "DIRECT_PAYMENT" ? (
                                "Place order"
                              ) : paymentOption === "PAY_UPFRONT" ? (
                                stkStatus === "SENT" ? (
                                  "Place order"
                                ) : (
                                  "Pay with M-Pesa and place order"
                                )
                              ) : (
                                "Place order, pay on delivery"
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

      {/* ORDER SUCCESS: ticket */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-[#14161F]/70 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Order confirmed"
          >
            <motion.div
              initial={{ y: 24, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 24, scale: 0.97 }}
              className="my-auto w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              <div className="bg-[#2A3BFF] px-6 pb-9 pt-6 text-white">
                <div className="flex items-center gap-2 text-sm font-bold text-white/80">
                  <CheckCircle2 size={18} />
                  Order placed
                </div>
                <h2
                  className="mt-2 text-3xl font-extrabold leading-tight tracking-[-0.02em]"
                  style={display}
                >
                  Thanks, {orderSuccess.orderedByName}
                </h2>
                <p className="mt-1 text-sm text-white/75">
                  {listing?.businessName || "The store"} is preparing your order.
                </p>
              </div>

              {/* perforation */}
              <div className="relative -mt-4 h-8">
                <span className="absolute -left-4 top-0 h-8 w-8 rounded-full bg-[#14161F]/70" />
                <span className="absolute -right-4 top-0 h-8 w-8 rounded-full bg-[#14161F]/70" />
                <div className="absolute inset-x-6 top-1/2 border-t-2 border-dashed border-[#14161F]/20" />
              </div>

              <div className="px-6 pb-6 pt-1">
                <p className="text-center text-xs font-semibold text-[#14161F]/55">
                  Give this name at the counter or to your rider
                </p>
                <div className="mt-2 rounded-2xl border-2 border-dashed border-[#14161F]/25 bg-[#FFD83D]/30 px-4 py-4 text-center">
                  <span
                    className="select-all break-all text-4xl font-extrabold tracking-tight"
                    style={display}
                  >
                    {waCode}
                  </span>
                </div>
                <div className="mt-3 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(waCode);
                      toast.success(`Copied "${waCode}"`);
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-lg bg-[#EEF0F6] px-3 py-2 text-xs font-bold transition hover:bg-[#FFD83D] ${focusRing}`}
                  >
                    <Clipboard size={13} />
                    Copy name
                  </button>
                </div>

                <div className="mt-5">
                  {orderSuccess.paymentOption === "PAY_DIRECT" ? (
                    orderSuccess.paymentStatus === "PAID" ? (
                      <Notice
                        tone="green"
                        icon={<CheckCircle2 size={16} />}
                        title="Payment confirmed"
                      >
                        {orderSuccess.transactionCode && (
                          <p>
                            M-Pesa code:{" "}
                            <span className="rounded bg-white px-1.5 py-0.5 font-mono font-bold text-[#14161F]">
                              {orderSuccess.transactionCode}
                            </span>
                          </p>
                        )}
                        <p>
                          Your code matched an incoming payment for the order
                          total.
                        </p>
                      </Notice>
                    ) : (
                      <Notice
                        tone="amber"
                        icon={<Clock size={16} />}
                        title="Waiting for the business to confirm payment"
                      >
                        {orderSuccess.transactionCode && (
                          <p>
                            Code you sent:{" "}
                            <span className="rounded bg-white px-1.5 py-0.5 font-mono font-bold text-[#14161F]">
                              {orderSuccess.transactionCode}
                            </span>
                          </p>
                        )}
                        {orderSuccess.paymentEvidence?.receiptUrl && (
                          <div>
                            <p className="mb-1 font-semibold">Receipt attached</p>
                            <img
                              src={orderSuccess.paymentEvidence.receiptUrl}
                              alt="Receipt"
                              className="h-16 w-16 rounded-lg border border-[#14161F]/10 object-cover"
                            />
                          </div>
                        )}
                        <p>
                          The business will check their M-Pesa records before
                          they dispatch or hand over your order.
                        </p>
                      </Notice>
                    )
                  ) : orderSuccess.paymentOption === "PAY_UPFRONT" ? (
                    orderSuccess.paymentStatus === "PAID" ? (
                      <Notice
                        tone="green"
                        icon={<CheckCircle2 size={16} />}
                        title="Payment received"
                      >
                        <p>
                          Receipt:{" "}
                          <span className="font-mono font-bold text-[#14161F]">
                            {orderSuccess.mpesaReceipt}
                          </span>
                        </p>
                      </Notice>
                    ) : orderSuccess.paymentStatus === "CANCELLED" ||
                      orderSuccess.paymentStatus === "FAILED" ||
                      orderSuccess.paymentStatus === "TIMED_OUT" ? (
                      <Notice
                        tone="red"
                        icon={<AlertTriangle size={16} />}
                        title="Payment not completed"
                      >
                        <p>
                          {orderSuccess.paymentStatus === "TIMED_OUT"
                            ? "We have not received payment yet. You can pay the business when you collect or receive your order."
                            : "The M-Pesa prompt was cancelled on your phone. You can pay the business when you collect or receive your order."}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            setOrderSuccess((prev: any) =>
                              prev
                                ? {
                                    ...prev,
                                    paymentOption: "PAY_ON_DELIVERY",
                                    paymentStatus: "PAY_ON_DELIVERY",
                                  }
                                : null,
                            )
                          }
                          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-white py-2 text-xs font-bold text-[#14161F] transition hover:bg-[#FFD83D]"
                        >
                          <Truck size={14} />
                          Pay on delivery instead
                        </button>
                      </Notice>
                    ) : (
                      <Notice
                        tone="amber"
                        icon={<ButtonLoader size={15} />}
                        title="Waiting for your M-Pesa PIN"
                      >
                        <p>
                          Enter your PIN on the prompt we sent to your phone to
                          pay.
                        </p>
                      </Notice>
                    )
                  ) : (
                    <Notice
                      tone="slate"
                      icon={<Truck size={16} />}
                      title="Pay on delivery"
                    >
                      <p>
                        Pay cash or send M-Pesa to the business when you collect
                        or receive your order.
                      </p>
                    </Notice>
                  )}
                </div>

                <div className="mt-5 grid gap-2">
                  {listing?.phone &&
                    (() => {
                      const code = waCode;
                      const waText =
                        orderSuccess.paymentOption === "PAY_DIRECT"
                          ? `Hi ${listing.businessName}, I just placed order "${code}" and paid directly. Name: ${orderSuccess.orderedByName}${orderSuccess.transactionCode ? `, M-Pesa Code: ${orderSuccess.transactionCode}` : ""}. Total: KES ${Number(orderSuccess.totalAmount || 0).toLocaleString()}.`
                          : orderSuccess.paymentOption === "PAY_UPFRONT"
                            ? `Hi ${listing.businessName}, I just placed order "${code}" (${orderSuccess.paymentStatus === "PAID" ? `Paid Upfront M-Pesa Receipt: ${orderSuccess.mpesaReceipt}` : "M-Pesa STK Prompt Sent"}). My name is ${orderSuccess.orderedByName}.`
                            : `Hi ${listing.businessName}, I just placed order "${code}" (Pay on Delivery / Collection). My name is ${orderSuccess.orderedByName}.`;

                      return (
                        <a
                          href={`https://wa.me/${formatWhatsAppNumber(listing.phone)}?text=${encodeURIComponent(waText)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 rounded-xl bg-[#14161F] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#2A3BFF]"
                        >
                          <MessageCircle size={17} />
                          Tell the business on WhatsApp
                        </a>
                      );
                    })()}

                  <button
                    type="button"
                    onClick={() => setOrderSuccess(null)}
                    className="rounded-xl border border-[#14161F]/20 px-5 py-3 text-sm font-bold text-[#14161F]/70 transition hover:bg-[#EEF0F6]"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACTIVE PICKUP TICKET (24h) */}
      {!orderSuccess && savedOrderPass && (
        <div
          className={`fixed left-4 z-40 w-[calc(100%-2rem)] max-w-xs ${
            cart.length > 0 && !isCartOpen ? "bottom-28" : "bottom-4"
          }`}
        >
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#14161F] bg-[#FFD83D] py-2 pl-4 pr-2 shadow-[3px_3px_0_#14161F]">
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-[#14161F]/65">
                Your pickup name
              </p>
              <p
                className="truncate text-base font-extrabold text-[#14161F]"
                style={display}
              >
                {savedOrderPass.pickupCode ||
                  generatePickupCode(savedOrderPass.saleId)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setOrderSuccess(savedOrderPass)}
                className="rounded-lg bg-[#14161F] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#2A3BFF]"
              >
                View ticket
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem(`hlynk_order_pass_${slug}`);
                  setSavedOrderPass(null);
                }}
                className="grid h-8 w-8 place-items-center rounded-lg text-[#14161F]/60 transition hover:bg-white/60 hover:text-[#14161F]"
                aria-label="Dismiss pickup ticket"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GALLERY */}
      <AnimatePresence>
        {gallery && (
          <GalleryModal
            images={gallery.images}
            title={gallery.title}
            description={gallery.description}
            onClose={() => setGallery(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}