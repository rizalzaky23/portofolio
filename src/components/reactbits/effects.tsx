import { useRef, useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

// ===== SplitText (from ReactBits pattern) =====
// Animates text word-by-word or char-by-char on scroll into view
interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  animateBy?: "words" | "chars";
  direction?: "top" | "bottom" | "left" | "right";
}

export const SplitText = ({
  text,
  className = "",
  delay = 50,
  animateBy = "words",
  direction = "top",
}: SplitTextProps) => {
  const elements = animateBy === "words" ? text.split(" ") : text.split("");
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current!);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const fromVars = useMemo(() => {
    switch (direction) {
      case "bottom": return { opacity: 0, y: 20, filter: "blur(8px)" };
      case "left": return { opacity: 0, x: -20, filter: "blur(8px)" };
      case "right": return { opacity: 0, x: 20, filter: "blur(8px)" };
      default: return { opacity: 0, y: -20, filter: "blur(8px)" };
    }
  }, [direction]);

  return (
    <p ref={ref} className={`flex flex-wrap ${className}`}>
      {elements.map((el, i) => (
        <motion.span
          key={i}
          initial={fromVars}
          animate={inView ? { opacity: 1, y: 0, x: 0, filter: "blur(0px)" } : fromVars}
          transition={{ duration: 0.5, delay: i * (delay / 1000), ease: "easeOut" }}
          className="inline-block"
          style={{ marginRight: animateBy === "words" ? "0.3em" : undefined }}
        >
          {el}
        </motion.span>
      ))}
    </p>
  );
};

// ===== BlurText (from ReactBits pattern) =====
// Text fades in from blur on scroll
interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export const BlurText = ({
  text,
  className = "",
  delay = 100,
}: BlurTextProps) => {
  const words = text.split(" ");
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current!);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <p ref={ref} className={`flex flex-wrap ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: "blur(12px)", y: 8 }}
          animate={
            inView
              ? { opacity: 1, filter: "blur(0px)", y: 0 }
              : { opacity: 0, filter: "blur(12px)", y: 8 }
          }
          transition={{
            duration: 0.6,
            delay: i * (delay / 1000),
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="inline-block mr-[0.3em]"
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
};

// ===== Magnet (from ReactBits pattern) =====
// Elements that subtly attract towards mouse cursor
interface MagnetProps {
  children: React.ReactNode;
  padding?: number;
  strength?: number;
  className?: string;
}

export const Magnet = ({
  children,
  padding = 80,
  strength = 1.5,
  className = "",
}: MagnetProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = false;
    let rafId = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) return;
      const clientX = e.clientX;
      const clientY = e.clientY;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const el = ref.current;
        if (!el) return;
        const { left, top, width, height } = el.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        const distX = clientX - centerX;
        const distY = clientY - centerY;
        const maxDist = Math.max(width, height) / 2 + padding;

        if (distX * distX + distY * distY < maxDist * maxDist) {
          active = true;
          el.style.transition = "transform 0.2s ease-out";
          el.style.transform = `translate3d(${distX / strength}px, ${distY / strength}px, 0)`;
        } else if (active) {
          active = false;
          el.style.transition = "transform 0.5s ease-in-out";
          el.style.transform = "translate3d(0px, 0px, 0)";
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [padding, strength]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

// ===== AnimatedCounter (from ReactBits pattern) =====
// Counts up a number when scrolled into view
interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  className?: string;
  duration?: number;
}

export const AnimatedCounter = ({
  target,
  suffix = "",
  className = "",
  duration = 2000,
}: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current!);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, target, duration]);

  return (
    <span ref={ref} className={className}>
      {count}{suffix}
    </span>
  );
};
