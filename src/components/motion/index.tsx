"use client";

import {
  motion,
  AnimatePresence,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

const EASE = [0.25, 0.1, 0.25, 1] as const;

/* ------------------------------ FadeInOnScroll ---------------------------- */
export function FadeInOnScroll({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ----------------------------- StaggerContainer --------------------------- */
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function StaggerContainer({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} variants={container} initial="hidden" animate={inView ? "show" : "hidden"} className={className}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "", ...props }: { children: ReactNode } & HTMLMotionProps<"div">) {
  return (
    <motion.div variants={item} className={className} {...props}>
      {children}
    </motion.div>
  );
}

/* ------------------------------ PageTransition ---------------------------- */
export function PageTransition({ children, className = "" }: { children: ReactNode; className?: string }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        className={className}
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -8 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/* -------------------------------- HoverCard ------------------------------- */
export function HoverCard({
  children,
  className = "",
  lift = -4,
  ...props
}: { children: ReactNode; lift?: number } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: lift, scale: 1.01, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* --------------------------------- SlideIn -------------------------------- */
export function SlideIn({
  children,
  from = "bottom",
  className = "",
}: {
  children: ReactNode;
  from?: "bottom" | "left" | "right" | "top";
  className?: string;
}) {
  const dir = { bottom: { y: 40 }, top: { y: -40 }, left: { x: -40 }, right: { x: 40 } };
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...dir[from] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------ NumberCounter ----------------------------- */
export function NumberCounter({
  value,
  prefix = "",
  suffix = "",
  className = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 60, damping: 20 });
  const text = useTransform(spring, (v) => `${prefix}${Math.round(v).toLocaleString("es-MX")}${suffix}`);

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);

  return (
    <span ref={ref} className={className}>
      <motion.span>{text}</motion.span>
    </span>
  );
}
