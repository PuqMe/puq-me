"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";

/**
 * Simple SVG-based Radar Map
 * Shows nearby users without external dependencies
 */
export function RadarMap() {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [coordinates] = useState({ lat: 48.1351, lng: 11.5820 }); // Munich, default

  useEffect(() => {
    if (!canvasRef.current) return;

    // Draw SVG radar
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", "0 0 400 400");
    svg.setAttribute("class", "w-full h-full");

    // Background
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    bg.setAttribute("cx", "200");
    bg.setAttribute("cy", "200");
    bg.setAttribute("r", "200");
    bg.setAttribute("fill", "#0f172a");
    svg.appendChild(bg);

    // Radar circles
    for (let i = 1; i <= 3; i++) {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", "200");
      circle.setAttribute("cy", "200");
      circle.setAttribute("r", String(i * 60));
      circle.setAttribute("fill", "none");
      circle.setAttribute("stroke", "#a855f7");
      circle.setAttribute("stroke-width", "1");
      circle.setAttribute("opacity", "0.3");
      svg.appendChild(circle);
    }

    // Crosshairs
    const hLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    hLine.setAttribute("x1", "0");
    hLine.setAttribute("y1", "200");
    hLine.setAttribute("x2", "400");
    hLine.setAttribute("y2", "200");
    hLine.setAttribute("stroke", "#a855f7");
    hLine.setAttribute("stroke-width", "1");
    hLine.setAttribute("opacity", "0.2");
    svg.appendChild(hLine);

    const vLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    vLine.setAttribute("x1", "200");
    vLine.setAttribute("y1", "0");
    vLine.setAttribute("x2", "200");
    vLine.setAttribute("y2", "400");
    vLine.setAttribute("stroke", "#a855f7");
    vLine.setAttribute("stroke-width", "1");
    vLine.setAttribute("opacity", "0.2");
    svg.appendChild(vLine);

    // User position (center)
    const userDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    userDot.setAttribute("cx", "200");
    userDot.setAttribute("cy", "200");
    userDot.setAttribute("r", "8");
    userDot.setAttribute("fill", "#a855f7");
    userDot.setAttribute("class", "animate-pulse");
    svg.appendChild(userDot);

    // Simulated nearby users
    const users = [
      { x: 220, y: 160, name: "Alex, 28", distance: "2.4 km" },
      { x: 170, y: 220, name: "Jordan, 26", distance: "3.1 km" },
      { x: 240, y: 200, name: "Casey, 30", distance: "1.8 km" },
      { x: 200, y: 130, name: "Morgan, 27", distance: "4.2 km" },
      { x: 150, y: 150, name: "Riley, 25", distance: "3.8 km" }
    ];

    users.forEach((u, i) => {
      const userCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      userCircle.setAttribute("cx", String(u.x));
      userCircle.setAttribute("cy", String(u.y));
      userCircle.setAttribute("r", "6");
      userCircle.setAttribute("fill", `hsl(${280 + i * 15}, 80%, 60%)`);
      userCircle.setAttribute("class", "hover:r-8 transition-all cursor-pointer");
      userCircle.setAttribute("data-name", u.name);
      userCircle.setAttribute("data-distance", u.distance);

      // Hover tooltip
      userCircle.addEventListener("mouseenter", (e) => {
        const target = e.target as SVGCircleElement;
        const name = target.getAttribute("data-name");
        const distance = target.getAttribute("data-distance");

        // Show tooltip
        const tooltip = document.createElementNS("http://www.w3.org/2000/svg", "text");
        tooltip.setAttribute("x", String(u.x + 10));
        tooltip.setAttribute("y", String(u.y - 10));
        tooltip.setAttribute("fill", "white");
        tooltip.setAttribute("font-size", "12");
        tooltip.setAttribute("class", "pointer-events-none");
        tooltip.setAttribute("id", "radar-tooltip");
        tooltip.textContent = `${name} (${distance})`;
        svg.appendChild(tooltip);
      });

      userCircle.addEventListener("mouseleave", () => {
        const tooltip = svg.querySelector("#radar-tooltip");
        if (tooltip) tooltip.remove();
      });

      svg.appendChild(userCircle);
    });

    // Add legend
    const legend = document.createElementNS("http://www.w3.org/2000/svg", "text");
    legend.setAttribute("x", "10");
    legend.setAttribute("y", "30");
    legend.setAttribute("fill", "#a855f7");
    legend.setAttribute("font-size", "14");
    legend.setAttribute("font-weight", "bold");
    legend.textContent = `📍 Radar • Hier sind jetzt Leute • Klick zum chatten!`;
    svg.appendChild(legend);

    // Coordinates
    const coords = document.createElementNS("http://www.w3.org/2000/svg", "text");
    coords.setAttribute("x", "10");
    coords.setAttribute("y", "380");
    coords.setAttribute("fill", "#a855f7");
    coords.setAttribute("font-size", "11");
    coords.setAttribute("opacity", "0.6");
    coords.textContent = `📌 ${coordinates.lat.toFixed(4)}° N, ${coordinates.lng.toFixed(4)}° O • München`;
    svg.appendChild(coords);

    canvasRef.current.innerHTML = "";
    canvasRef.current.appendChild(svg);
  }, [coordinates]);

  return (
    <div className="flex flex-col gap-4">
      {/* Map Container */}
      <div
        ref={canvasRef}
        className="w-full h-[500px] rounded-[2rem] overflow-hidden border border-white/12 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900"
      />

      {/* Info Panel */}
      <div className="grid gap-3 md:grid-cols-3">
        <div className="glass-card rounded-[1.2rem] p-4">
          <div className="text-xs font-semibold uppercase text-white/60">Deine Position</div>
          <div className="mt-2 text-sm text-white">📍 München, Bayern</div>
        </div>
        <div className="glass-card rounded-[1.2rem] p-4">
          <div className="text-xs font-semibold uppercase text-white/60">Jetzt aktiv</div>
          <div className="mt-2 text-sm text-white">👥 5 Kandidaten in 2-4km</div>
        </div>
        <div className="glass-card rounded-[1.2rem] p-4">
          <div className="text-xs font-semibold uppercase text-white/60">Deine Sichtbarkeit</div>
          <div className="mt-2 text-sm text-white">🟢 Sichtbar für alle</div>
        </div>
      </div>

      {/* User List */}
      <div className="grid gap-2">
        <h3 className="text-sm font-semibold text-white/80">Kandidaten in der Nähe</h3>
        <div className="grid gap-2">
          {[
            { name: "Alex, 28", distance: "2.4 km", city: "Schwabing" },
            { name: "Jordan, 26", distance: "3.1 km", city: "Maxvorstadt" },
            { name: "Casey, 30", distance: "1.8 km", city: "Altstadt" },
            { name: "Morgan, 27", distance: "4.2 km", city: "Neuhausen" },
            { name: "Riley, 25", distance: "3.8 km", city: "Bogenhausen" }
          ].map((person, i) => (
            <div
              key={i}
              className="glass-card rounded-[1rem] p-3 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div>
                <div className="text-sm font-semibold text-white">{person.name}</div>
                <div className="text-xs text-white/60">{person.city}</div>
              </div>
              <div className="text-xs font-semibold text-[#a855f7]">{person.distance}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
