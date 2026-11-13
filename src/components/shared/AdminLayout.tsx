import React, { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  DollarSign,
  Building2,
  Users,
  CreditCard,
  Receipt,
  ShieldCheck,
  Star,
  BarChart3,
  Bell,
  Bolt,
  HelpCircle,
  HardDrive,
  LogOut,
  AppWindowMac,
  CircleEllipsis,
  X,
  Home,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useDragControls,
  useTransform,
} from "framer-motion";
import { useAuth } from "../../lib/auth/AuthContext";
import TopNav from "./TopNav";
import { DraggableBottomSheet } from "./DraggableBottomSheet";

interface AdminNavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
}

const adminNavItems: AdminNavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/system-performance", label: "Performance", icon: Activity },
  { to: "/admin/financials", label: "Financials", icon: DollarSign },
  { to: "/admin/businesses", label: "Providers", icon: Building2 },
  { to: "/admin/user-operations", label: "Users", icon: Users },
  { to: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { to: "/admin/payments", label: "Payments", icon: Receipt },
  { to: "/admin/storage", label: "Cloud & Backups", icon: HardDrive },
  { to: "/admin/forensic-audit", label: "Audit & Security", icon: ShieldCheck },
  { to: "/admin/community-reviews", label: "Reviews", icon: Star },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/settings", label: "System Settings", icon: Bolt },
  { to: "/admin/help", label: "Admin Help", icon: HelpCircle },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out of the Admin portal?")) {
      await logout({ force: true });
      navigate("/login");
    }
  };

  return (
    <div className="flex h-screen h-[100dvh] overflow-hidden bg-slate-50/50 text-slate-900">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200/80 shadow-sm transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Header / Brand */}
        <div className="h-16 lg:h-20 flex items-center justify-between px-4 border-b border-slate-100 flex-shrink-0 pt-[max(1.5rem,calc(env(safe-area-inset-top,0px)+0.75rem))] lg:pt-0 min-h-[calc(4.5rem+env(safe-area-inset-top,0px))] lg:min-h-[5rem]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="">
              <img src="/hlynk.png" className="h-[40px]" alt="hlynk Logo" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-extrabold text-slate-900 tracking-wider leading-none">
                  hlynk Inc.
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 tracking-widest mt-1">
                  Super Admin
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                    isActive
                      ? "bg-emerald-50 text-[#00694B] font-bold border border-emerald-100/60 shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  } ${isCollapsed ? "justify-center" : ""}`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer / User Info & Logout */}
        <div className="p-3 border-t border-slate-100 flex-shrink-0">
          {!isCollapsed && (
            <div className="mb-3 px-2 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user?.name || "Administrator"}
                </p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
              <Link
                to="/dashboard"
                className="text-[10px] font-bold text-emerald-700 hover:underline flex-shrink-0"
              >
                <AppWindowMac />
              </Link>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100/60 transition-colors ${
              isCollapsed ? "justify-center" : ""
            }`}
            title="Log Out"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!isCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50">
        <TopNav
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((v) => !v)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/30 text-slate-900 pb-28 lg:pb-8 max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation (matches the provider portal) */}
      <AdminMobileBottomNav user={user} onLogout={handleLogout} />
    </div>
  );
}

const avatarFor = (user: any) =>
  user?.photoUrl ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "")}&background=0D4A3E&color=fff`;

// â”€â”€â”€ Admin Mobile Bottom Navigation Bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Same structure and styling as the provider portal's MobileBottomNav:
// Home Â· primary tab Â· centre CTA Â· More (draggable sheet) Â· You (account sheet)
function AdminMobileBottomNav({
  user,
  onLogout,
}: {
  user: any;
  onLogout: () => void;
}) {
  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const [showProfileSheet, setShowProfileSheet] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setShowMoreSheet(false);
    setShowProfileSheet(false);
  }, [location.pathname]);

  const homeItem: AdminNavItem = { to: "/admin", label: "Overview", icon: Home, end: true };
  const primaryLeftItem: AdminNavItem = { to: "/admin/businesses", label: "Providers", icon: Building2, end: false };
  const centerCtaItem: AdminNavItem = { to: "/admin/payments", label: "Payments", icon: Receipt, end: false };

  // Everything else goes in the "More" sheet. Settings lives in the "You" sheet.
  const mainPaths = [homeItem.to, primaryLeftItem.to, centerCtaItem.to, "/admin/settings"];
  const overflowItems = adminNavItems.filter((item) => !mainPaths.includes(item.to));

  const isOverflowActive = overflowItems.some(
    (item) =>
      location.pathname === item.to || location.pathname.startsWith(item.to + "/"),
  );
  const onSettings = location.pathname.includes("/settings");

  const renderNavItem = (item: AdminNavItem) => (
    <NavLink
      key={item.label}
      to={item.to}
      end={item.end}
      className="flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 no-tap-highlight"
    >
      {({ isActive }) => (
        <>
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${isActive ? "bg-emerald-50" : "bg-transparent"}`}
          >
            <item.icon
              className={`w-[18px] h-[18px] transition-colors ${isActive ? "text-[#0D4A3E]" : "text-[#0D4A3E] opacity-35"}`}
              strokeWidth={isActive ? 2.5 : 2}
            />
          </div>
          <span
            className={`text-[9px] font-normal transition-all truncate w-full text-center ${isActive ? "text-[#0D4A3E]" : "text-slate-400"}`}
          >
            {item.label}
          </span>
        </>
      )}
    </NavLink>
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-[95] lg:hidden flex flex-col items-center pointer-events-none">
      {/* Draggable "More" sheet (owns its own backdrop so dimming follows the drag) */}
      <MoreSheet
        open={showMoreSheet}
        onClose={() => setShowMoreSheet(false)}
        items={overflowItems}
      />

      {/* "You" account sheet — draggable up and down */}
      <DraggableBottomSheet
        open={showProfileSheet}
        onClose={() => setShowProfileSheet(false)}
        title="My Account"
        zIndexBackdrop="z-[96]"
        zIndexSheet="z-[97]"
      >
        <div>
          {/* User identity card */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
            <img
              src={avatarFor(user)}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover border border-emerald-600/20 flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                Signed in as
              </p>
              <p className="text-sm font-bold text-slate-900 truncate">
                {user?.name || "Administrator"}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Icon grid */}
          <div className="grid grid-cols-3 gap-y-5 gap-x-1 px-3 pt-5 pb-[max(1.5rem,calc(env(safe-area-inset-bottom,0px)+1rem))]">
            <Link
              to="/admin/settings"
              onClick={() => setShowProfileSheet(false)}
              className="flex flex-col items-center gap-2 no-tap-highlight group active:scale-95 transition-transform"
            >
              <div className="w-[60px] h-[60px] rounded-full border-2 border-slate-200 flex items-center justify-center bg-white transition-colors group-active:bg-slate-100">
                <Bolt className="w-6 h-6 text-slate-900" strokeWidth={1.75} />
              </div>
              <span className="text-[12px] leading-tight text-center px-0.5 text-slate-800">
                Settings
              </span>
            </Link>

            <Link
              to="/dashboard"
              onClick={() => setShowProfileSheet(false)}
              className="flex flex-col items-center gap-2 no-tap-highlight group active:scale-95 transition-transform"
            >
              <div className="w-[60px] h-[60px] rounded-full border-2 border-slate-200 flex items-center justify-center bg-white transition-colors group-active:bg-slate-100">
                <AppWindowMac className="w-6 h-6 text-slate-900" strokeWidth={1.75} />
              </div>
              <span className="text-[12px] leading-tight text-center px-0.5 text-slate-800">
                Provider UI
              </span>
            </Link>

            <button
              onClick={() => {
                setShowProfileSheet(false);
                onLogout();
              }}
              className="flex flex-col items-center gap-2 no-tap-highlight group active:scale-95 transition-transform"
            >
              <div className="w-[60px] h-[60px] rounded-full border-2 border-red-200 flex items-center justify-center bg-white transition-colors group-active:bg-red-50">
                <LogOut className="w-6 h-6 text-red-500" strokeWidth={1.75} />
              </div>
              <span className="text-[12px] leading-tight text-center px-0.5 text-red-500">
                Log Out
              </span>
            </button>
          </div>
        </div>
      </DraggableBottomSheet>

      {/* Dock */}
      <div className="w-full pointer-events-auto glass-dock rounded-t-[3rem] pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom,0.6rem))]">
        <div className="flex items-end justify-evenly w-full px-4">
          {renderNavItem(homeItem)}
          {renderNavItem(primaryLeftItem)}

          <NavLink
            key={centerCtaItem.label}
            to={centerCtaItem.to}
            end={centerCtaItem.end}
            className="flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 no-tap-highlight"
          >
            {({ isActive }) => (
              <>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 -mt-2 shadow-md
                  ${isActive ? "bg-emerald-500 shadow-emerald-500/40 text-white" : "bg-[#0D4A3E] text-white shadow-emerald-900/30 hover:bg-emerald-800"}`}
                >
                  <centerCtaItem.icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <span
                  className={`text-[9px] font-normal transition-all truncate w-full text-center mt-0.5 ${isActive ? "text-[#0D4A3E]" : "text-slate-400"}`}
                >
                  {centerCtaItem.label}
                </span>
              </>
            )}
          </NavLink>

          <button
            key="more-btn"
            onClick={() => {
              setShowProfileSheet(false);
              setShowMoreSheet((v) => !v);
            }}
            className="flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 no-tap-highlight"
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${showMoreSheet || isOverflowActive ? "bg-emerald-50" : "bg-transparent"}`}
            >
              <CircleEllipsis
                className={`w-[18px] h-[18px] transition-colors ${showMoreSheet || isOverflowActive ? "text-[#0D4A3E]" : "text-[#0D4A3E] opacity-35"}`}
              />
            </div>
            <span
              className={`text-[9px] font-normal transition-all truncate w-full text-center ${showMoreSheet || isOverflowActive ? "text-[#0D4A3E]" : "text-slate-400"}`}
            >
              More
            </span>
          </button>

          <button
            key="profile-btn"
            onClick={() => {
              setShowMoreSheet(false);
              setShowProfileSheet((v) => !v);
            }}
            className="flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 no-tap-highlight"
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 overflow-hidden ${showProfileSheet || onSettings ? "ring-2 ring-emerald-500 ring-offset-1" : ""}`}
            >
              <img
                src={avatarFor(user)}
                alt="Profile"
                className="w-7 h-7 rounded-full object-cover"
              />
            </div>
            <span
              className={`text-[9px] font-bold transition-all truncate w-full text-center ${showProfileSheet || onSettings ? "text-[#0D4A3E]" : "text-slate-400"}`}
            >
              You
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Draggable "More" bottom sheet â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Height hugs its content (no empty gap top or bottom), up to 90% of the screen.
// Drag it freely: it stays wherever you let go between "peek" and "fully open",
// and closes on a pull-down or a fast flick.
function MoreSheet({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: AdminNavItem[];
}) {
  const dragControls = useDragControls();
  const [vh, setVh] = useState(() => window.innerHeight);
  const [contentH, setContentH] = useState(0);
  const [fullyOpen, setFullyOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const didDrag = useRef(false);

  // Sheet is exactly as tall as its content, capped at 90% of the viewport
  const maxH = Math.round(vh * 0.9);
  const sheetH = contentH ? Math.min(contentH, maxH) : Math.round(vh * 0.6);
  const overflowing = contentH > maxH;
  // Default (peek) position shows up to 55% of the screen
  const peekVisible = Math.min(sheetH, Math.round(vh * 0.55));
  const snaps = { expanded: 0, peek: sheetH - peekVisible, closed: sheetH };

  const snapsRef = useRef(snaps);
  snapsRef.current = snaps;

  const y = useMotionValue(window.innerHeight);

  const backdropOpacity = useTransform(y, (v) => {
    const s = snapsRef.current;
    const t = (v - s.peek) / (s.closed - s.peek || 1);
    return Math.max(0, Math.min(1, 1 - t));
  });

  useEffect(() => {
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Measure the natural content height (header + grid)
  useEffect(() => {
    const measure = () => {
      const h =
        (headerRef.current?.offsetHeight || 0) + (gridRef.current?.offsetHeight || 0);
      if (h) setContentH(h);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (headerRef.current) ro.observe(headerRef.current);
    if (gridRef.current) ro.observe(gridRef.current);
    return () => ro.disconnect();
  }, [items.length]);

  // Track "fully open" so the grid only scrolls when the sheet is at the top
  useEffect(() => y.on("change", (v) => setFullyOpen(v <= 2)), [y]);

  const spring = { type: "spring" as const, stiffness: 380, damping: 36, mass: 0.9 };

  useEffect(() => {
    if (open) {
      setVisible(true);
      animate(y, snaps.peek, spring);
    } else {
      animate(y, snaps.closed, { ...spring, onComplete: () => setVisible(false) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sheetH]);

  const handleDragEnd = (_: any, info: { velocity: { y: number } }) => {
    const s = snaps;
    const projected = y.get() + info.velocity.y * 0.2;
    // Pulled far enough down (or flicked down): close
    const closeThreshold = s.peek + (s.closed - s.peek) * 0.45;
    if (projected > closeThreshold) {
      onClose();
    } else {
      // Otherwise stay where it was released, within the allowed range
      const target = Math.max(s.expanded, Math.min(s.peek, projected));
      animate(y, target, spring);
    }
    setTimeout(() => (didDrag.current = false), 50);
  };

  const toggleHeight = () => {
    if (snaps.peek <= 0) return;
    animate(y, y.get() > snaps.peek / 2 ? snaps.expanded : snaps.peek, spring);
  };

  const gridScrolls = fullyOpen && overflowing;

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[96] bg-slate-900/40"
        style={{
          opacity: backdropOpacity,
          pointerEvents: open ? "auto" : "none",
          visibility: visible ? "visible" : "hidden",
        }}
        onClick={onClose}
      />

      <motion.div
        className="fixed inset-x-0 bottom-0 z-[97] flex flex-col"
        style={{
          height: sheetH,
          y,
          pointerEvents: open ? "auto" : "none",
          visibility: visible ? "visible" : "hidden",
        }}
        drag="y"
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: snaps.closed }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragStart={() => (didDrag.current = true)}
        onDragEnd={handleDragEnd}
      >
        <div className="bg-white rounded-t-[3rem] flex flex-col flex-1 min-h-0 overflow-hidden shadow-[0_-4px_24px_rgba(0,0,0,0.12)]">
          {/* Header (always a drag zone) */}
          <div
            ref={headerRef}
            className="bg-slate-50 flex-shrink-0 select-none"
            style={{ touchAction: "none" }}
            onPointerDown={(e) => dragControls.start(e)}
          >
            <motion.div
              className="flex justify-center pt-2.5 pb-1 cursor-grab active:cursor-grabbing"
              onTap={toggleHeight}
            >
              <div className="h-[4px] w-10 rounded-full bg-slate-300" />
            </motion.div>

            <div className="relative flex items-center justify-center px-5 py-2.5">
              <p className="text-lg font-medium text-slate-900">Quick Actions</p>
            </div>
          </div>

          {/* Grid: draggable unless it is fully open AND long enough to scroll */}
          <div
            className={`flex-1 min-h-0 ${gridScrolls ? "overflow-y-auto custom-scrollbar" : "overflow-hidden"}`}
            style={{ touchAction: gridScrolls ? "pan-y" : "none" }}
            onPointerDown={(e) => {
              if (!gridScrolls) dragControls.start(e);
            }}
          >
            <div
              ref={gridRef}
              className="grid grid-cols-3 gap-y-5 gap-x-1 px-3 pt-5 pb-[max(1.25rem,calc(env(safe-area-inset-bottom,0px)+0.75rem))]"
            >
              {items.map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={false}
                  animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
                  transition={{ delay: open ? 0.05 + i * 0.02 : 0, duration: 0.2 }}
                >
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={(e) => {
                      if (didDrag.current) {
                        e.preventDefault();
                        return;
                      }
                      onClose();
                    }}
                    className="flex flex-col items-center gap-2 no-tap-highlight group active:scale-95 transition-transform"
                  >
                    {({ isActive }) => (
                      <>
                        <div
                          className={`w-[60px] h-[60px] rounded-full border-2 flex items-center justify-center bg-white transition-colors group-active:bg-slate-100 ${
                            isActive ? "border-emerald-500" : "border-slate-200"
                          }`}
                        >
                          <item.icon
                            className={`w-6 h-6 ${isActive ? "text-emerald-700" : "text-slate-900"}`}
                            strokeWidth={1.75}
                          />
                        </div>
                        <span
                          className={`text-[12px] leading-tight text-center px-0.5 ${
                            isActive ? "text-emerald-700 font-medium" : "text-slate-800"
                          }`}
                        >
                          {item.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}