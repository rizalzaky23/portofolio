import { useEffect, useRef } from "react";
import { cn } from "../lib/utils";

export interface MorphingTextProps {
  texts: string[];
  className?: string;
  morphTime?: number;
  cooldownTime?: number;
}

export function MorphingText({
  texts,
  className,
  morphTime = 1.5,
  cooldownTime = 0.6,
}: MorphingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!texts || texts.length === 0) return;

    let animationFrameId = 0;
    let isVisible = false;
    let time = performance.now();
    let morph = 0;
    let cooldown = cooldownTime;
    let index = 0;

    const elts = {
      text1: text1Ref.current,
      text2: text2Ref.current,
    };

    if (!elts.text1 || !elts.text2) return;

    elts.text1.textContent = texts[index % texts.length];
    elts.text2.textContent = texts[(index + 1) % texts.length];

    function setMorph(fraction: number) {
      if (!elts.text1 || !elts.text2) return;

      elts.text2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      elts.text2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

      const invFraction = 1 - fraction;
      elts.text1.style.filter = `blur(${Math.min(8 / invFraction - 8, 100)}px)`;
      elts.text1.style.opacity = `${Math.pow(invFraction, 0.4) * 100}%`;
    }

    function doMorph() {
      morph -= cooldown;
      cooldown = 0;

      let fraction = morph / morphTime;

      if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
      }

      setMorph(fraction);
    }

    function doCooldown() {
      morph = 0;
      if (!elts.text1 || !elts.text2) return;

      elts.text2.style.filter = "";
      elts.text2.style.opacity = "100%";

      elts.text1.style.filter = "";
      elts.text1.style.opacity = "0%";
    }

    function animate(now: number) {
      if (!isVisible) {
        animationFrameId = 0;
        return;
      }
      animationFrameId = requestAnimationFrame(animate);

      const dt = Math.min((now - time) / 1000, 0.1);
      time = now;

      cooldown -= dt;

      if (cooldown <= 0) {
        doMorph();
      } else {
        doCooldown();
      }

      if (morph >= morphTime) {
        index = (index + 1) % texts.length;
        if (elts.text1 && elts.text2) {
          elts.text1.textContent = texts[index % texts.length];
          elts.text2.textContent = texts[(index + 1) % texts.length];
        }
        morph = 0;
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animationFrameId) {
          time = performance.now();
          animationFrameId = requestAnimationFrame(animate);
        } else if (!isVisible && animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = 0;
        }
      },
      { threshold: 0.05 }
    );
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [texts, morphTime, cooldownTime]);

  // Find longest text string to reserve width container space
  const longestText = texts.reduce((a, b) => (a.length > b.length ? a : b), "");

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative inline-flex items-center justify-center font-extrabold tracking-tight select-none",
        className
      )}
    >
      <span
        ref={text1Ref}
        className="absolute inset-0 flex items-center justify-center text-center"
      />
      <span
        ref={text2Ref}
        className="absolute inset-0 flex items-center justify-center text-center"
      />
      {/* Invisible placeholder for structural spacing */}
      <span className="opacity-0 pointer-events-none px-2 py-1">
        {longestText}
      </span>
    </div>
  );
}

export default MorphingText;
