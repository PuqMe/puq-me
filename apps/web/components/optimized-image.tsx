"use client";

import { useState } from "react";

type OptimizedImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  fallbackInitials?: string;
  fallbackColor?: string;
  rounded?: boolean;
};

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  style,
  priority = false,
  fallbackInitials,
  fallbackColor = "#a855f7",
  rounded = false,
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const baseStyle: React.CSSProperties = {
    ...style,
    borderRadius: rounded ? "50%" : style?.borderRadius,
    objectFit: "cover" as const,
    transition: "opacity 0.3s ease",
  };

  if (error || !src) {
    // Fallback avatar with initials
    return (
      <div
        className={className}
        role="img"
        aria-label={alt}
        style={{
          ...baseStyle,
          width: width || 48,
          height: height || 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: fallbackColor,
          color: "#ffffff",
          fontWeight: 700,
          fontSize: Math.round((width || 48) * 0.35),
        }}
      >
        {fallbackInitials || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      onError={() => setError(true)}
      onLoad={() => setLoaded(true)}
      style={{
        ...baseStyle,
        opacity: loaded ? 1 : 0,
      }}
    />
  );
}
