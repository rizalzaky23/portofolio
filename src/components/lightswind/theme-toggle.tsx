import React, { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { cn } from "../lib/utils";

export type AnimationType =
  | "none"
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
  duration = 900,
  animationType = "random",
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

    // Enable smooth CSS transitions during theme switch
    document.documentElement.classList.add("theme-transitioning");
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
    }, 600);

    // Fallback for browsers that do not support View Transitions
    if (!(document as any).startViewTransition) {
      setIsDark(newTheme);
      if (newTheme) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      return;
    }

    const transition = (document as any).startViewTransition(() => {
      flushSync(() => {
        setIsDark(newTheme);
        if (newTheme) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("theme", newTheme ? "dark" : "light");
      });
    });

    await transition.ready;

    // Calculate coordinates and dimensions for spatial animations
    const btn = buttonRef.current;
    const left = btn
      ? btn.getBoundingClientRect().left
      : window.innerWidth / 2;
    const top = btn
      ? btn.getBoundingClientRect().top
      : window.innerHeight / 2;
    const width = btn ? btn.getBoundingClientRect().width : 40;
    const height = btn ? btn.getBoundingClientRect().height : 40;

    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top)
    );
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    switch (currentAnimation) {
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
