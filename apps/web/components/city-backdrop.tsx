const cityTiles = [
  {
    city: "Berlin",
    image:
      "https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=600&q=60"
  },
  {
    city: "Hamburg",
    image:
      "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=600&q=60"
  },
  {
    city: "München",
    image:
      "https://images.unsplash.com/photo-1595867818082-083862f3d630?auto=format&fit=crop&w=600&q=60"
  },
  {
    city: "Köln",
    image:
      "https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?auto=format&fit=crop&w=600&q=60"
  },
  {
    city: "Wien",
    image:
      "https://images.unsplash.com/photo-1516557070061-c3d1653fa646?auto=format&fit=crop&w=600&q=60"
  },
  {
    city: "Zürich",
    image:
      "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=600&q=60"
  }
];

export function CityBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      <div className="mosaic-wall absolute inset-0 grid grid-cols-3 gap-3 p-3 opacity-90 md:grid-cols-4">
        {cityTiles.map((tile, index) => (
          <div
            key={tile.city}
            className={`city-tile ${index % 3 === 0 ? "row-span-2" : ""} ${index % 4 === 1 ? "translate-y-8" : ""}`}
            style={{ backgroundImage: `linear-gradient(180deg, rgba(11, 6, 24, 0.16), rgba(11, 6, 24, 0.74)), url(${tile.image})` }}
          >
            <span className="city-tile__label">{tile.city}</span>
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.28),transparent_20%),linear-gradient(180deg,rgba(7,9,16,0.18),rgba(7,9,16,0.72))]" />
    </div>
  );
}
