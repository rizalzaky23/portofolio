import { cn } from "../lib/utils";

export interface AuroraTextEffectProps {
  text: string;
  className?: string;
  textClassName?: string;
  fontSize?: string;
  colors?: {
    first?: string;
    second?: string;
    third?: string;
    fourth?: string;
  };
  blurAmount?:
  | "blur-none"
  | "blur-sm"
  | "blur-md"
  | "blur-lg"
  | "blur-xl"
  | "blur-2xl"
  | "blur-3xl"
  | string;
  animationSpeed?: {
    border?: number;
    first?: number;
    second?: number;
    third?: number;
    fourth?: number;
  };
}

export function AuroraTextEffect({
  text,
  className,
  textClassName,
  fontSize = "clamp(3rem, 8vw, 7rem)",
  animationSpeed = {
    border: 6,
    first: 5,
    second: 5,
    third: 3,
    fourth: 13,
  },
}: AuroraTextEffectProps) {
  const duration = Math.max(4, (animationSpeed.first ?? 5) + (animationSpeed.third ?? 3));

  const keyframes = `
    @keyframes aurora-text-shift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `;

  return (
    <div
      className={cn(
        "bg-transparent flex items-center justify-center",
        className
      )}
    >
      <style>{keyframes}</style>
      <h2
        className={cn(
          "font-extrabold tracking-tight leading-none bg-clip-text text-transparent select-none",
          textClassName
        )}
        style={{
          fontSize,
          backgroundImage:
            "linear-gradient(115deg, #22d3ee 0%, #3b82f6 25%, #a855f7 50%, #facc15 75%, #22d3ee 100%)",
          backgroundSize: "250% 250%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: `aurora-text-shift ${duration}s ease-in-out infinite`,
        }}
      >
        {text}
      </h2>
    </div>
  );
}
