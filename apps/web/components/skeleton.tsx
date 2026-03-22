"use client";

export function Skeleton({
  width,
  height,
  borderRadius = 8,
  style,
}: {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: React.CSSProperties;
}) {
  return (
    <>
      <div
        className="skeleton-shimmer"
        style={{
          width: width ?? "100%",
          height: height ?? 16,
          borderRadius,
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)",
          backgroundSize: "200% 100%",
          ...style,
        }}
      />
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .skeleton-shimmer {
          animation: skeleton-shimmer 1.5s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

export function CardSkeleton() {
  return (
    <div
      style={{
        padding: "16px",
        borderRadius: 20,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Skeleton width={48} height={48} borderRadius={24} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={10} />
        </div>
      </div>
      <Skeleton width="100%" height={10} />
      <Skeleton width="80%" height={10} />
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            padding: "9px 12px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <Skeleton width={44} height={44} borderRadius={22} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <Skeleton width="50%" height={14} />
            <Skeleton width="30%" height={10} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: "20px 14px",
      }}
    >
      <div style={{ display: "flex", gap: 8 }}>
        <Skeleton width="33%" height={60} borderRadius={16} />
        <Skeleton width="33%" height={60} borderRadius={16} />
        <Skeleton width="33%" height={60} borderRadius={16} />
      </div>
      <ListSkeleton count={4} />
    </div>
  );
}
