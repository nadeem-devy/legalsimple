"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "icon" | "full";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  darkMode?: boolean;
}

const sizes = {
  sm: { icon: 24, full: { width: 100, height: 60 } },
  md: { icon: 32, full: { width: 140, height: 84 } },
  lg: { icon: 48, full: { width: 180, height: 108 } },
  xl: { icon: 64, full: { width: 240, height: 144 } },
};

export function Logo({ variant = "icon", size = "md", className, darkMode = false }: LogoProps) {
  if (variant === "full") {
    return (
      <div className={cn("flex items-center gap-2.5", className)}>
        <LogoIcon size={size} darkMode={darkMode} />
        <span className={cn(
          "font-semibold tracking-tight",
          size === "sm" && "text-base",
          size === "md" && "text-lg",
          size === "lg" && "text-xl",
          size === "xl" && "text-2xl",
          darkMode ? "text-white" : "text-slate-900"
        )}>
          <span className="font-bold">Legal</span>
          <span className="font-light text-emerald-600">Simple</span>
        </span>
      </div>
    );
  }

  return <LogoIcon size={size} darkMode={darkMode} className={className} />;
}

interface LogoIconProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  darkMode?: boolean;
}

export function LogoIcon({ size = "md", className, darkMode = false }: LogoIconProps) {
  const iconSize = sizes[size].icon;
  const primaryColor = "#059669"; // emerald-600
  const secondaryColor = darkMode ? "#e2e8f0" : "#1e293b"; // slate-200 or slate-800

  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Modern shield shape */}
      <path
        d="M24 4L6 12V22C6 33.05 13.65 43.28 24 46C34.35 43.28 42 33.05 42 22V12L24 4Z"
        fill={primaryColor}
        fillOpacity="0.1"
        stroke={primaryColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Stylized L */}
      <path
        d="M16 16V32H26"
        stroke={secondaryColor}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Stylized S */}
      <path
        d="M32 18C32 18 30 16 27 16C24 16 22 18 22 20C22 22 24 23 27 24C30 25 32 26 32 28C32 30 30 32 27 32C24 32 22 30 22 30"
        stroke={primaryColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LogoFull({ size = "md", className, darkMode = false }: LogoIconProps) {
  return (
    <Logo variant="full" size={size} className={className} darkMode={darkMode} />
  );
}
