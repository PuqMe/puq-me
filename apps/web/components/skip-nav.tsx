"use client";

export function SkipNav() {
  return (
    <a
      href="#main-content"
      style={{
        position: "absolute",
        left: "-9999px",
        top: "auto",
        width: "1px",
        height: "1px",
        overflow: "hidden",
        zIndex: 9999,
        padding: "1rem",
        backgroundColor: "#a855f7",
        color: "#ffffff",
        fontWeight: 600,
        fontSize: "0.875rem",
        textDecoration: "none",
        borderRadius: "0 0 0.5rem 0",
      }}
      onFocus={(e) => {
        e.currentTarget.style.left = "0";
        e.currentTarget.style.width = "auto";
        e.currentTarget.style.height = "auto";
      }}
      onBlur={(e) => {
        e.currentTarget.style.left = "-9999px";
        e.currentTarget.style.width = "1px";
        e.currentTarget.style.height = "1px";
      }}
    >
      Zum Hauptinhalt springen
    </a>
  );
}
