import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import {
  motion,
  animate,
  useMotionValue,
  useDragControls,
  useTransform,
} from "framer-motion";

interface DraggableBottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  zIndexBackdrop?: string;
  zIndexSheet?: string;
  children: React.ReactNode;
}

export function DraggableBottomSheet({
  open,
  onClose,
  title,
  zIndexBackdrop = "z-[100]",
  zIndexSheet = "z-[101]",
  children,
}: DraggableBottomSheetProps) {
  const dragControls = useDragControls();
  const [vh, setVh] = useState(() => (typeof window !== "undefined" ? window.innerHeight : 800));
  const [contentH, setContentH] = useState(0);
  const [fullyOpen, setFullyOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const didDrag = useRef(false);

  const maxH = Math.round(vh * 0.9);
  const sheetH = contentH ? Math.min(contentH, maxH) : Math.round(vh * 0.7);
  const overflowing = contentH > maxH;
  const peekVisible = Math.min(sheetH, Math.round(vh * 0.58));
  const snaps = { expanded: 0, peek: sheetH - peekVisible, closed: sheetH };

  const snapsRef = useRef(snaps);
  snapsRef.current = snaps;

  const y = useMotionValue(typeof window !== "undefined" ? window.innerHeight : 800);

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

  useEffect(() => {
    const measure = () => {
      const h =
        (headerRef.current?.offsetHeight || 0) + (bodyRef.current?.offsetHeight || 0);
      if (h) setContentH(h);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (headerRef.current) ro.observe(headerRef.current);
    if (bodyRef.current) ro.observe(bodyRef.current);
    return () => ro.disconnect();
  }, [children]);

  useEffect(() => y.on("change", (v) => setFullyOpen(v <= 2)), [y]);

  const spring = { type: "spring" as const, stiffness: 380, damping: 36, mass: 0.9 };

  useEffect(() => {
    if (open) {
      setVisible(true);
      animate(y, snaps.peek, spring);
    } else {
      animate(y, snaps.closed, { ...spring, onComplete: () => setVisible(false) });
    }
  }, [open, sheetH]);

  const handleDragEnd = (_: any, info: { velocity: { y: number } }) => {
    const s = snaps;
    const projected = y.get() + info.velocity.y * 0.2;
    const closeThreshold = s.peek + (s.closed - s.peek) * 0.45;
    if (projected > closeThreshold) {
      onClose();
    } else {
      const target = Math.max(s.expanded, Math.min(s.peek, projected));
      animate(y, target, spring);
    }
    setTimeout(() => (didDrag.current = false), 50);
  };

  const toggleHeight = () => {
    if (snaps.peek <= 0) return;
    animate(y, y.get() > snaps.peek / 2 ? snaps.expanded : snaps.peek, spring);
  };

  const bodyScrolls = fullyOpen && overflowing;

  return (
    <>
      <motion.div
        className={`fixed inset-0 ${zIndexBackdrop} bg-slate-900/40`}
        style={{
          opacity: backdropOpacity,
          pointerEvents: open ? "auto" : "none",
          visibility: visible ? "visible" : "hidden",
        }}
        onClick={onClose}
      />

      <motion.div
        className={`fixed inset-x-0 bottom-0 ${zIndexSheet} flex flex-col`}
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
        <div className="bg-white rounded-t-[3rem] flex flex-col flex-1 min-h-0 overflow-hidden shadow-[0_-4px_24px_rgba(0,0,0,0.15)] border-t border-slate-100">
          {/* Header (always drag zone) */}
          <div
            ref={headerRef}
            className="bg-slate-50 flex-shrink-0 select-none border-b border-slate-100"
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
              <p className="text-base font-semibold text-slate-900">{title}</p>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onClose}
                className="absolute right-5 p-1 active:opacity-50 transition-opacity text-slate-400 hover:text-slate-700"
                aria-label="Close"
              >
                {/* <X size={20} strokeWidth={2} /> */}
              </button>
            </div>
          </div>

          {/* Body */}
          <div
            className={`flex-1 min-h-0 ${bodyScrolls ? "overflow-y-auto custom-scrollbar" : "overflow-hidden"}`}
            style={{ touchAction: bodyScrolls ? "pan-y" : "none" }}
            onPointerDown={(e) => {
              if (!bodyScrolls) dragControls.start(e);
            }}
          >
            <div ref={bodyRef}>
              {children}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

