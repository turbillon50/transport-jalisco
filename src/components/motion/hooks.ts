"use client";

import { useScroll, useTransform, useMotionValue, useSpring, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

/** Parallax-style scroll reveal: fades + lifts an element as it enters/leaves. */
export function useScrollAnimation() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.3], [40, 0]);
  return { ref, opacity, y };
}

/** Subtle pointer parallax for hero/decorative layers. */
export function useMouseParallax(strength = 0.02) {
  const x = useSpring(useMotionValue(0), { stiffness: 80, damping: 20 });
  const y = useSpring(useMotionValue(0), { stiffness: 80, damping: 20 });
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      x.set((e.clientX - window.innerWidth / 2) * strength);
      y.set((e.clientY - window.innerHeight / 2) * strength);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [x, y, strength]);
  return { x, y };
}

/** Returns a ref + boolean once the element scrolls into view. */
export function useInViewAnimation(threshold = 0.1) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: threshold });
  return { ref, inView };
}
