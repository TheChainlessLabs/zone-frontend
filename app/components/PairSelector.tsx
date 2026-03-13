"use client";

import { useState } from "react";
import { Search, Star } from "lucide-react";

const filterTabs = ["All", "Majors", "Minors", "Stable", "★"] as const;

interface PairSelectorProps {
  onSearch?: (query: string) => void;
  onFilter?: (filter: string) => void;
}

export default function PairSelector({ onSearch, onFilter }: PairSelectorProps) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("All");

  return (
    <div className="flex flex-col gap-2">
      {/* Search */}
      <div className="flex items-center h-[36px] bg-bg-base border border-border rounded-md px-3 gap-2">
        <Search size={14} className="text-text-muted shrink-0" />
        <input
          type="text"
          placeholder="Search pairs..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch?.(e.target.value);
          }}
          className="flex-1 bg-transparent text-body-sm outline-none text-text-primary placeholder:text-text-muted"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-bg-base rounded-md p-1">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveFilter(tab);
              onFilter?.(tab);
            }}
            className={`flex-1 h-[24px] text-body-sm font-medium rounded-sm transition-fast ${
              activeFilter === tab
                ? "bg-bg-elevated text-text-primary"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {tab === "★" ? <Star size={12} className="mx-auto" /> : tab}
          </button>
        ))}
      </div>
    </div>
  );
}
