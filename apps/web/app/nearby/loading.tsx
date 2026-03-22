export default function NearbyLoading() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#07050f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "2px solid #a855f7",
          borderTopColor: "transparent",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
        Karte wird geladen…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
