"use client";

import {
  APPLICATIONS,
  CATEGORY_ORDER,
  type Application,
} from "@/lib/applications";

type Props = {
  selected: Set<string>;
  onToggle: (id: string) => void;
  onClear: () => void;
  onSelectAll: () => void;
  onSelectCategory: (cat: string) => void;
};

export function ApplicationPicker({
  selected,
  onToggle,
  onClear,
  onSelectAll,
  onSelectCategory,
}: Props) {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: APPLICATIONS.filter((a) => a.category === cat),
  }));

  return (
    <div>
      <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-ink-mute">
        <span>{selected.size} de {APPLICATIONS.length} selecionada{selected.size === 1 ? "" : "s"}</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSelectAll}
            className="hover:text-vermilion"
          >
            Todas
          </button>
          <span className="text-ink-line">·</span>
          <button
            type="button"
            onClick={onClear}
            className="hover:text-vermilion"
          >
            Nenhuma
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {grouped.map(({ cat, items }) => (
          <div key={cat}>
            <div className="mb-2 flex items-baseline gap-2">
              <button
                type="button"
                onClick={() => onSelectCategory(cat)}
                className="font-mono text-[10px] uppercase tracking-widest text-ink-soft hover:text-vermilion"
              >
                {cat}
              </button>
              <span className="flex-1 border-t border-dotted border-ink-line" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-mute num">
                {String(items.length).padStart(2, "0")}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {items.map((a) => (
                <ApplicationChip
                  key={a.id}
                  app={a}
                  selected={selected.has(a.id)}
                  onClick={() => onToggle(a.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApplicationChip({
  app,
  selected,
  onClick,
}: {
  app: Application;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col items-start gap-0.5 border px-2.5 py-2 text-left transition-all ${
        selected
          ? "border-vermilion bg-vermilion text-paper"
          : "border-ink/15 bg-paper-tint hover:border-ink/40"
      }`}
    >
      <span className="font-serif text-[13px] leading-tight">
        {app.name}
      </span>
      <span
        className={`font-mono text-[9px] uppercase tracking-widest ${
          selected ? "text-paper/70" : "text-ink-mute"
        }`}
      >
        {selected ? "Selecionada" : app.suggestedRatio ?? ""}
      </span>
      {selected && (
        <span className="absolute right-1.5 top-1.5 font-mono text-[10px] text-paper">
          ✓
        </span>
      )}
    </button>
  );
}
