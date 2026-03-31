"use client";

import { useState } from "react";

interface AISearchBarProps {
  onResults: (data: {
    filters: Record<string, unknown>;
    sort_by: string;
    sort_order: "asc" | "desc";
    results: unknown;
  }) => void;
  loading: boolean;
  onLoadingChange: (loading: boolean) => void;
}

export default function AISearchBar({
  onResults,
  loading,
  onLoadingChange,
}: AISearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    onLoadingChange(true);
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        onResults(data);
      }
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-20 group-hover:opacity-30 group-focus-within:opacity-40 blur transition-opacity" />
        <div className="relative flex items-center bg-surface rounded-xl border border-border shadow-sm">
          <div className="pl-4 pr-2 text-muted">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe your ideal car... e.g. &quot;fast German SUV with turbo, under 6 seconds 0-100&quot;"
            className="flex-1 py-3.5 px-2 bg-transparent text-sm focus:outline-none placeholder:text-muted/60"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="mr-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover disabled:opacity-40 transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Thinking...
              </>
            ) : (
              "Search"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
