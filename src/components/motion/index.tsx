"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";

/* ----------------------------- PageTransition ----------------------------- */
export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------------------- FadeInOnScroll ------------------------------ */
export function FadeInOnScroll({
  children,
  className,
  delay = 0,
  y = 24,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* --------------------------- StaggerContainer ----------------------------- */
const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export function StaggerContainer({
  children,
  className,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  ...props
}: { children: ReactNode } & HTMLMotionProps<"div">) {
  return (
    <motion.div className={className} variants={itemVariants} {...props}>
      {children}
    </motion.div>
  );
}

/* ------------------------------- HoverCard -------------------------------- */
export function HoverCard({
  children,
  className,
  lift = -4,
  ...props
}: { children: ReactNode; lift?: number } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: lift, boxShadow: "0 18px 40px -12px rgba(0,40,99,0.22)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* --------------------------------- SlideIn -------------------------------- */
export function SlideIn({
  children,
  className,
  from = "right",
  open = true,
}: {
  children: ReactNode;
  className?: string;
  from?: "right" | "left" | "bottom";
  open?: boolean;
}) {
  const offset =
    from === "right" ? { x: "100%" } : from === "left" ? { x: "-100%" } : { y: "100%" };
  return (
    <motion.div
      className={className}
      initial={offset}
      animate={open ? { x: 0, y: 0 } : offset}
      transition={{ type: "spring", stiffness: 300, damping: 32 }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------ NumberCounter ----------------------------- */
export function NumberCounter({
  value,
  className,
  suffix = "",
  prefix = "",
}: {
  value: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 90, damping: 22 });
  const rounded = useTransform(spring, (v) => `${prefix}${Math.round(v).toLocaleString("es-MX")}${suffix}`);

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);

  return <motion.span ref={ref} className={className}>{rounded}</motion.span>;
}
