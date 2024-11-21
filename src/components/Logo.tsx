"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function Logo({ className = "", width = 120, height = 30 }: LogoProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent flash of incorrect logo
  }

  const isDark = theme === "dark" || resolvedTheme === "dark";

  return (
    <Image
      src={isDark ? "/logo-white.svg" : "/logo-black.svg"}
      alt="CharpstAR Logo"
      width={width}
      height={height}
      priority
      className={`transition-opacity duration-300 ${className}`}
    />
  );
}