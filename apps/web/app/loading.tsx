import { LogoMark } from "@puqme/ui";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Wird geladen">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-soft-pulse">
          <LogoMark className="h-10 w-10 text-[#a855f7]" size={40} />
        </div>
        <div className="h-1 w-24 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#a855f7] to-[#bf84ff]"
            style={{
              animation: "loadingBar 1.4s ease-in-out infinite",
            }}
          />
        </div>
        <style>{`
          @keyframes loadingBar {
            0% { width: 0; margin-left: 0; }
            50% { width: 70%; margin-left: 15%; }
            100% { width: 0; margin-left: 100%; }
          }
        `}</style>
      </div>
    </div>
  );
}
