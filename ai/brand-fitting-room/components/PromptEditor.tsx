"use client";

import { useState } from "react";
import { APPLICATIONS } from "@/lib/applications";

type Props = {
  selectedIds: string[];
  overrides: Record<string, string>;
  onChange: (id: string, value: string) => void;
  onResetOne: (id: string) => void;
  onResetAll: () => void;
};

export function PromptEditor({
  selectedIds,
  overrides,
  onChange,
  onResetOne,
  onResetAll,
}: Props) {
  const [open, setOpen] = useState<string | null>(
    selectedIds[0] ?? null
  );

  if (selectedIds.length === 0) {
    return (
      <div className="border border-dashed border-ink-line bg-paper-tint p-5 font-serif italic text-ink-mute">
        Selecione pelo menos uma aplicação acima. Cada superfície terá seu
        próprio briefing editável.
      </div>
    );
  }

  return (
    <div className="border border-ink/15 bg-paper-tint">
      <div className="flex items-center justify-between border-b border-ink/15 px-3 py-2 font-mono text-[10px] uppercase tracking-widest">
        <span className="text-ink-mute">
          {selectedIds.length} briefing{selectedIds.length === 1 ? "" : "s"} —
          editável por superfície
        </span>
        <button
          type="button"
          onClick={onResetAll}
          className="text-ink hover:text-vermilion"
        >
          Restaurar tudo
        </button>
      </div>
      <ul>
        {selectedIds.map((id) => {
          const app = APPLICATIONS.find((a) => a.id === id);
          if (!app) return null;
          const isOpen = open === id;
          const value =
            overrides[id] !== undefined ? overrides[id] : app.defaultPrompt;
          const isCustom = overrides[id] !== undefined;
          return (
            <li
              key={id}
              className="border-b border-ink/10 last:border-b-0"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : id)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-paper"
              >
                <span className="flex items-baseline gap-2">
                  <span
                    className={`font-mono text-[10px] ${
                      isOpen ? "text-vermilion" : "text-ink-mute"
                    }`}
                  >
                    {isOpen ? "▾" : "▸"}
                  </span>
                  <span className="font-serif text-[15px]">{app.name}</span>
                  {isCustom && (
                    <span className="font-mono text-[9px] uppercase tracking-widest text-vermilion">
                      Editado
                    </span>
                  )}
                </span>
                <span className="truncate font-serif text-[12px] italic text-ink-mute">
                  {value.length > 80
                    ? value.slice(0, 80) + "…"
                    : value}
                </span>
              </button>
              {isOpen && (
                <div className="px-3 pb-3">
                  <textarea
                    value={value}
                    onChange={(e) => onChange(id, e.target.value)}
                    rows={5}
                    className="w-full resize-none border border-ink/15 bg-paper px-3 py-2 font-serif text-[14px] leading-relaxed text-ink outline-none focus:border-vermilion"
                    spellCheck={false}
                  />
                  <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-ink-mute">
                    <span className="num">{value.length} caracteres</span>
                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => onResetOne(id)}
                        className="hover:text-vermilion"
                      >
                        Voltar ao padrão
                      </button>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
