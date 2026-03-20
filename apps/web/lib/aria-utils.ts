// ARIA utilities for accessible components

export function getAriaLabel(type: "profile" | "card" | "match" | "follower", name: string, extra?: string): string {
  const labels: Record<string, string> = {
    profile: `Profil von ${name}`,
    card: `Aktivitätskarte von ${name}`,
    match: `Match mit ${name}`,
    follower: `Follower ${name}`,
  };
  const base = labels[type] || name;
  return extra ? `${base}, ${extra}` : base;
}

export function getProfileAlt(name: string, age?: number, city?: string): string {
  const parts = [`Profilfoto von ${name}`];
  if (age) parts.push(`${age} Jahre`);
  if (city) parts.push(`aus ${city}`);
  return parts.join(", ");
}

export function getLiveRegionProps(polite: boolean = true) {
  return {
    "aria-live": polite ? ("polite" as const) : ("assertive" as const),
    "aria-atomic": true as const,
    role: "status" as const,
  };
}

export function getToastAriaProps() {
  return {
    role: "alert" as const,
    "aria-live": "assertive" as const,
    "aria-atomic": true as const,
  };
}
