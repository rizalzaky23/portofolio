import React, { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { cn } from "../lib/utils";

export type AnimationType =
  | "none"
  | "ink-bleed"
  | "circle-spread"
  | "round-morph"
  | "swipe-left"
  | "swipe-up"
  | "diag-down-right"
  | "fade-in-out"
  | "shrink-grow"
  | "flip-x-in"
  | "split-vertical"
  | "swipe-right"
  | "swipe-down"
  | "wave-ripple";

const INK_MASK_SIZE = 256;
// Core solid radius is >= 0.192 of canvas width after inward noise/tendrils
const INK_CORE_RATIO = 0.18;

/**
 * Generates an organic ink-bleed alpha mask PNG (domain-warped fBm blob +
 * directional lobes + ridged tendrils + isolated speckles) so the GPU scales
 * a single 256x256 texture instead of re-rasterizing an SVG filter at huge DPR.
 */
function createInkBleedMask(seed: number): string {
  const size = INK_MASK_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Fast deterministic 2D gradient noise (32x32 tileable lattice)
  const cells = 32;
  const gx = new Float32Array(cells * cells);
  const gy = new Float32Array(cells * cells);
  let s = (seed >>> 0) || 1;
  const rand = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = 0; i < gx.length; i++) {
    const a = rand() * Math.PI * 2;
    gx[i] = Math.cos(a);
    gy[i] = Math.sin(a);
  }

  const gnoise = (x: number, y: number): number => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const fx = x - xi;
    const fy = y - yi;
    const u = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
    const v = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
    const x0 = ((xi % cells) + cells) % cells;
    const y0 = ((yi % cells) + cells) % cells;
    const x1 = (x0 + 1) % cells;
    const y1 = (y0 + 1) % cells;
    const i00 = y0 * cells + x0;
    const i10 = y0 * cells + x1;
    const i01 = y1 * cells + x0;
    const i11 = y1 * cells + x1;
    const n00 = gx[i00] * fx + gy[i00] * fy;
    const n10 = gx[i10] * (fx - 1) + gy[i10] * fy;
    const n01 = gx[i01] * fx + gy[i01] * (fy - 1);
    const n11 = gx[i11] * (fx - 1) + gy[i11] * (fy - 1);
    const nx0 = n00 + (n10 - n00) * u;
    const nx1 = n01 + (n11 - n01) * u;
    return (nx0 + (nx1 - nx0) * v) * 1.45;
  };

  const fbm = (x: number, y: number, octaves: number): number => {
    let sum = 0;
    let amp = 0.5;
    let norm = 0;
    let px = x;
    let py = y;
    for (let i = 0; i < octaves; i++) {
      sum += amp * gnoise(px, py);
      norm += amp;
      const nx = (0.8 * px - 0.6 * py) * 2.03 + 17.13;
      const ny = (0.6 * px + 0.8 * py) * 2.03 + 17.13;
      px = nx;
      py = ny;
      amp *= 0.5;
    }
    return sum / norm;
  };

  const smoothstep = (e0: number, e1: number, x: number): number => {
    const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  };

  const img = ctx.createImageData(size, size);
  const data = img.data;
  const half = size / 2;
  const R = size * 0.31; // base radius (~79px)
  const rot = rand() * Math.PI * 2;
  const cosR = Math.cos(rot);
  const sinR = Math.sin(rot);
  const ox = rand() * 20;
  const oy = rand() * 20;

  for (let y = 0; y < size; y++) {
    const dy = y - half + 0.5;
    for (let x = 0; x < size; x++) {
      const dx = x - half + 0.5;
      const d = Math.hypot(dx, dy);
      const idx = (y * size + x) * 4;

      // Fast early-out for solid core & empty outer corners
      if (d < R * 0.62) {
        data[idx] = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
        data[idx + 3] = 255;
        continue;
      }
      if (d > half - 2) continue;

      const invD = 1 / Math.max(d, 1e-3);
      const ux = (dx * cosR - dy * sinR) * invD;
      const uy = (dx * sinR + dy * cosR) * invD;

      // Domain-warped blob + anisotropic directional lobes
      const qx = (dx / size) * 4.8 + ox;
      const qy = (dy / size) * 4.8 + oy;
      const wx = fbm(qx, qy, 3);
      const wy = fbm(qx + 5.2, qy + 1.3, 3);
      const blob = fbm(qx + 2.0 * wx, qy + 2.0 * wy, 4);
      const lobes = gnoise(ux * 1.1 + oy, uy * 1.1 + ox) * 0.75 +
        gnoise(ux * 2.3 + 9.1, uy * 2.3 + 4.7) * 0.25;
      const reach = Math.max(0.68, Math.min(1.36, 1 + 0.22 * lobes + 0.24 * blob));
      let f = d - R * reach;

      // Branching ink tendrils along ridged fBm zero-lines
      const gate = smoothstep(-0.25, 0.38, fbm(ux * 1.8 + 3.7, uy * 1.8 + 3.7, 3));
      const tn = fbm(ux * 2.6 + (d / size) * 3.0 + wx, uy * 2.6 - (d / size) * 2.2 + wy, 3);
      const ridgePx = Math.abs(tn) * Math.max(d, 16) * 0.22;
      const tendrilLen = R * 0.42 * gate * (0.4 + 0.6 * (gnoise(ux * 3.1, uy * 3.1) * 0.5 + 0.5));
      const along = Math.max(0, Math.min(1, f / Math.max(tendrilLen, 1)));
      const width = 4.2 * (1 - along * along) * gate;
      const ft = Math.max(f - tendrilLen, ridgePx - width);
      const k = 4.0;
      const hh = Math.max(0, Math.min(1, 0.5 + (0.5 * (ft - f)) / k));
      f = ft * (1 - hh) + f * hh - k * hh * (1 - hh);

      // Paper-fibre micro-edge
      f += gnoise(x * 0.28 + ox, y * 0.28 + oy) * 1.4;

      // Crisp ink frontier + soft diffusion haze + isolated droplets ahead
      let cov = 1 - smoothstep(-1.1, 1.1, f);
      if (f > 0 && f < 10) {
        const ahead = f / 10;
        const sn = gnoise(x * 0.42 + 41, y * 0.42 + 19) * 0.5 + 0.5;
        const th = 0.78 + 0.16 * ahead;
        cov = Math.max(cov, smoothstep(th, th + 0.05, sn) * 0.85 * (1 - ahead));
      }

      if (cov > 0.004) {
        data[idx] = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
        data[idx + 3] = Math.round(cov * 255);
      }
    }
  }

  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL("image/png");
}

const ANIMATION_TYPES: AnimationType[] = [
  "circle-spread",
  "round-morph",
  "swipe-left",
  "swipe-right",
  "swipe-up",
  "swipe-down",
  "diag-down-right",
  "fade-in-out",
  "shrink-grow",
  "wave-ripple",
  "split-vertical",
  "flip-x-in",
];

export interface ToggleThemeProps
  extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number;
  animationType?: AnimationType | "random";
}

/* ── Inline SVG icons for Sun & Moon ────────────────────────────── */

const SunIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);

/* ── Decorative tiny stars for dark-mode track ──────────────────── */

const StarsDecoration = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      overflow: "hidden",
      borderRadius: "inherit",
      pointerEvents: "none",
    }}
  >
    {[
      { top: "20%", left: "18%", size: 2, delay: "0s" },
      { top: "60%", left: "25%", size: 1.5, delay: "0.4s" },
      { top: "35%", left: "42%", size: 2.5, delay: "0.8s" },
      { top: "70%", left: "55%", size: 1.5, delay: "0.2s" },
      { top: "15%", left: "62%", size: 2, delay: "0.6s" },
      { top: "50%", left: "72%", size: 1, delay: "1s" },
    ].map((star, i) => (
      <span
        key={i}
        style={{
          position: "absolute",
          top: star.top,
          left: star.left,
          width: star.size,
          height: star.size,
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.8)",
          animation: `twinkle 2s ease-in-out ${star.delay} infinite`,
        }}
      />
    ))}
  </div>
);

/* ── Decorative clouds for light-mode track ─────────────────────── */

const CloudsDecoration = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      overflow: "hidden",
      borderRadius: "inherit",
      pointerEvents: "none",
    }}
  >
    {[
      { bottom: "10%", left: "10%", width: 16, height: 6, opacity: 0.6 },
      { bottom: "30%", left: "45%", width: 12, height: 5, opacity: 0.4 },
      { bottom: "18%", left: "65%", width: 14, height: 5, opacity: 0.5 },
    ].map((cloud, i) => (
      <span
        key={i}
        style={{
          position: "absolute",
          bottom: cloud.bottom,
          left: cloud.left,
          width: cloud.width,
          height: cloud.height,
          borderRadius: "999px",
          backgroundColor: `rgba(255,255,255,${cloud.opacity})`,
          boxShadow: `0 0 ${cloud.width / 2}px rgba(255,255,255,0.3)`,
        }}
      />
    ))}
  </div>
);

export function ThemeToggle({
  className,
  duration = 1400,
  animationType = "ink-bleed",
  ...props
}: ToggleThemeProps) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return (
        document.documentElement.classList.contains("dark") ||
        localStorage.getItem("theme") === "dark"
      );
    }
    return true;
  });

  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Inject keyframe animation + View Transition overrides
  useEffect(() => {
    let styleElement = document.getElementById(
      "toggle-theme-vt-override"
    ) as HTMLStyleElement;
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "toggle-theme-vt-override";
      styleElement.textContent = `
        ::view-transition-old(root),
        ::view-transition-new(root) {
          animation: none;
          mix-blend-mode: normal;
        }
        html.ink-bleed-active::view-transition-new(root) {
          mask-image: var(--ink-mask);
          -webkit-mask-image: var(--ink-mask);
          mask-repeat: no-repeat;
          -webkit-mask-repeat: no-repeat;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `;
      document.head.appendChild(styleElement);
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    const currentAnimation: AnimationType =
      animationType === "random"
        ? ANIMATION_TYPES[Math.floor(Math.random() * ANIMATION_TYPES.length)]
        : animationType;

    const newTheme = !isDark;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const applyTheme = () => {
      setIsDark(newTheme);
      if (newTheme) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("theme", newTheme ? "dark" : "light");
    };

    // Fallback for browsers without View Transitions or reduced motion
    if (!(document as any).startViewTransition || prefersReducedMotion) {
      if (!prefersReducedMotion) {
        document.documentElement.classList.add("theme-transitioning");
        setTimeout(() => {
          document.documentElement.classList.remove("theme-transitioning");
        }, 600);
      }
      applyTheme();
      return;
    }

    const root = document.documentElement;
    const isInkBleed = currentAnimation === "ink-bleed";
    if (isInkBleed) {
      const maskUrl = createInkBleedMask(Math.floor(Math.random() * 1e9) + 1);
      if (maskUrl) {
        root.style.setProperty("--ink-mask", `url("${maskUrl}")`);
        root.classList.add("ink-bleed-active");
      }
    }

    const cleanupInkMask = () => {
      if (isInkBleed) {
        root.classList.remove("ink-bleed-active");
        root.style.removeProperty("--ink-mask");
      }
    };

    const transition = (document as any).startViewTransition(() => {
      flushSync(applyTheme);
    });
    transition.finished?.finally(cleanupInkMask);

    try {
      await transition.ready;
    } catch {
      cleanupInkMask();
      return;
    }

    // Calculate coordinates and dimensions for spatial animations
    const rect = buttonRef.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    switch (currentAnimation) {
      case "ink-bleed": {
        // Core solid radius is >= INK_CORE_RATIO * maskSize, guaranteeing 100% coverage at end
        const finalSize = Math.ceil(maxRadius / INK_CORE_RATIO);
        root.animate(
          [
            {
              maskPosition: `${x}px ${y}px`,
              maskSize: "0px 0px",
            },
            {
              maskPosition: `${x - finalSize / 2}px ${y - finalSize / 2}px`,
              maskSize: `${finalSize}px ${finalSize}px`,
            },
          ],
          {
            duration,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            pseudoElement: "::view-transition-new(root)",
            fill: "forwards",
          }
        );
        break;
      }

      case "circle-spread":
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          }
        );
        break;

      case "round-morph":
        document.documentElement.animate(
          [
            { opacity: 0, transform: "scale(0.8) rotate(5deg)" },
            { opacity: 1, transform: "scale(1) rotate(0deg)" },
          ],
          {
            duration: duration * 1.2,
            easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
        break;

      case "swipe-left":
        document.documentElement.animate(
          {
            clipPath: [
              `inset(0 0 0 ${viewportWidth}px)`,
              `inset(0 0 0 0)`,
            ],
          },
          {
            duration,
            easing: "cubic-bezier(0.2, 0, 0, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
        break;

      case "swipe-right":
        document.documentElement.animate(
          {
            clipPath: [
              `inset(0 ${viewportWidth}px 0 0)`,
              `inset(0 0 0 0)`,
            ],
          },
          {
            duration,
            easing: "cubic-bezier(0.2, 0, 0, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
        break;

      case "swipe-up":
        document.documentElement.animate(
          {
            clipPath: [
              `inset(${viewportHeight}px 0 0 0)`,
              `inset(0 0 0 0)`,
            ],
          },
          {
            duration,
            easing: "cubic-bezier(0.2, 0, 0, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
        break;

      case "swipe-down":
        document.documentElement.animate(
          {
            clipPath: [
              `inset(0 0 ${viewportHeight}px 0)`,
              `inset(0 0 0 0)`,
            ],
          },
          {
            duration,
            easing: "cubic-bezier(0.2, 0, 0, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
        break;

      case "diag-down-right":
        document.documentElement.animate(
          {
            clipPath: [
              `polygon(0 0, 0 0, 0 0, 0 0)`,
              `polygon(0 0, 100% 0, 100% 100%, 0 100%)`,
            ],
          },
          {
            duration: duration * 1.3,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
        break;

      case "fade-in-out":
        document.documentElement.animate(
          {
            opacity: [0, 1],
          },
          {
            duration: duration * 0.7,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          }
        );
        break;

      case "shrink-grow":
        document.documentElement.animate(
          [
            { transform: "scale(0.9)", opacity: 0 },
            { transform: "scale(1)", opacity: 1 },
          ],
          {
            duration: duration * 1.2,
            easing: "cubic-bezier(0.19, 1, 0.22, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
        break;

      case "flip-x-in":
        document.documentElement.animate(
          [
            { transform: "rotateY(90deg)", opacity: 0 },
            { transform: "rotateY(0deg)", opacity: 1 },
          ],
          {
            duration: duration * 1.1,
            easing: "ease-out",
            pseudoElement: "::view-transition-new(root)",
          }
        );
        break;

      case "split-vertical":
        document.documentElement.animate(
          {
            clipPath: [`inset(50% 0 50% 0)`, `inset(0 0 0 0)`],
          },
          {
            duration: duration * 1.3,
            easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
        break;

      case "wave-ripple":
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0% at 50% 50%)`,
              `circle(${maxRadius}px at 50% 50%)`,
            ],
          },
          {
            duration: duration * 1.3,
            easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
        break;

      case "none":
      default:
        break;
    }
  }, [isDark, duration, animationType]);

  /* ── Switch dimensions ────────────────────────────────────────── */
  const TRACK_W = 56;
  const TRACK_H = 28;
  const THUMB_SIZE = 22;
  const THUMB_OFFSET = 3;

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn("relative cursor-pointer group", className)}
      aria-label="Toggle Theme"
      style={{
        width: TRACK_W,
        height: TRACK_H,
        border: "none",
        background: "none",
        padding: 0,
        outline: "none",
      }}
      {...props}
    >
      {/* ── Track ─────────────────────────────────────────────── */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: TRACK_H / 2,
          background: isDark
            ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
            : "linear-gradient(135deg, #87ceeb 0%, #56b4e9 50%, #4fa8de 100%)",
          border: isDark
            ? "1.5px solid rgba(255,255,255,0.12)"
            : "1.5px solid rgba(255,255,255,0.5)",
          boxShadow: isDark
            ? "inset 0 1px 4px rgba(0,0,0,0.5), 0 0 12px rgba(99,102,241,0.15)"
            : "inset 0 1px 4px rgba(0,0,0,0.1), 0 0 12px rgba(251,191,36,0.2)",
          transition:
            "background 0.5s cubic-bezier(0.4,0,0.2,1), border-color 0.5s cubic-bezier(0.4,0,0.2,1), box-shadow 0.5s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Stars (dark mode) */}
        <span
          style={{
            opacity: isDark ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        >
          <StarsDecoration />
        </span>

        {/* Clouds (light mode) */}
        <span
          style={{
            opacity: isDark ? 0 : 1,
            transition: "opacity 0.4s ease",
          }}
        >
          <CloudsDecoration />
        </span>
      </span>

      {/* ── Thumb ─────────────────────────────────────────────── */}
      <span
        style={{
          position: "absolute",
          top: THUMB_OFFSET,
          left: isDark ? TRACK_W - THUMB_SIZE - THUMB_OFFSET : THUMB_OFFSET,
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          borderRadius: "50%",
          background: isDark
            ? "linear-gradient(145deg, #c9c9cc 0%, #e8e8eb 50%, #d4d4d7 100%)"
            : "linear-gradient(145deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%)",
          boxShadow: isDark
            ? "0 2px 8px rgba(0,0,0,0.4), inset 0 -1px 2px rgba(0,0,0,0.15)"
            : "0 2px 8px rgba(251,191,36,0.5), 0 0 16px rgba(251,191,36,0.3), inset 0 -1px 2px rgba(0,0,0,0.1)",
          transition:
            "left 0.4s cubic-bezier(0.68,-0.55,0.265,1.55), background 0.5s ease, box-shadow 0.5s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2,
        }}
      >
        {/* Icon inside thumb */}
        {isDark ? (
          <MoonIcon
            className=""
            {...({
              style: {
                width: 13,
                height: 13,
                color: "#4a4a5a",
                transition: "color 0.3s ease, transform 0.4s ease",
                transform: "rotate(0deg)",
              },
            } as any)}
          />
        ) : (
          <SunIcon
            className=""
            {...({
              style: {
                width: 14,
                height: 14,
                color: "#fff",
                transition: "color 0.3s ease, transform 0.4s ease",
                transform: "rotate(0deg)",
                filter: "drop-shadow(0 0 2px rgba(255,255,255,0.6))",
              },
            } as any)}
          />
        )}

        {/* Moon craters (only in dark mode) */}
        {isDark && (
          <>
            <span
              style={{
                position: "absolute",
                top: 5,
                right: 5,
                width: 4,
                height: 4,
                borderRadius: "50%",
                backgroundColor: "rgba(0,0,0,0.08)",
                transition: "opacity 0.4s ease",
              }}
            />
            <span
              style={{
                position: "absolute",
                bottom: 6,
                left: 5,
                width: 3,
                height: 3,
                borderRadius: "50%",
                backgroundColor: "rgba(0,0,0,0.06)",
                transition: "opacity 0.4s ease",
              }}
            />
          </>
        )}
      </span>
    </button>
  );
}

export const ToggleTheme = ThemeToggle;
export default ThemeToggle;
