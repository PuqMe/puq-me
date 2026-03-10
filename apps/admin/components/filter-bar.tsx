"use client";

import { useMemo, useState } from "react";

export function FilterBar({
  searchPlaceholder,
  filters
}: {
  searchPlaceholder: string;
  filters: Array<{
    label: string;
    options: string[];
  }>;
}) {
  const [search, setSearch] = useState("");
  const filterPlaceholders = useMemo(() => filters, [filters]);

  return (
    <div className="flex flex-col gap-3 rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4 md:flex-row md:items-center">
      <input
        className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#08131f] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-300/40"
        onChange={(event) => setSearch(event.target.value)}
        placeholder={searchPlaceholder}
        value={search}
      />
      {filterPlaceholders.map((filter) => (
        <select
          key={filter.label}
          className="rounded-2xl border border-white/10 bg-[#08131f] px-4 py-3 text-sm text-slate-200 outline-none focus:border-orange-300/40"
          defaultValue={filter.options[0]}
        >
          {filter.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ))}
      <div className="rounded-2xl border border-white/10 px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-500">
        Query preview: {search ? `"${search}"` : "All"}
      </div>
    </div>
  );
}
