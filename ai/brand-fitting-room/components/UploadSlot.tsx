"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  logo: string | null;
  onChange: (dataUrl: string | null, fileName: string | null) => void;
  fileName: string | null;
};

const RASTER_TARGET = 1536;

async function rasterizeSvg(file: File): Promise<string> {
  const text = await file.text();
  const blobUrl = URL.createObjectURL(
    new Blob([text], { type: "image/svg+xml" })
  );
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Não foi possível interpretar o SVG."));
      i.src = blobUrl;
    });

    let w = img.naturalWidth;
    let h = img.naturalHeight;
    if (!w || !h) {
      const m = text.match(/viewBox\s*=\s*"([^"]+)"/);
      if (m) {
        const parts = m[1].trim().split(/\s+/).map(Number);
        if (parts.length === 4) {
          w = parts[2];
          h = parts[3];
        }
      }
    }
    if (!w || !h) {
      w = RASTER_TARGET;
      h = RASTER_TARGET;
    }

    const scale = RASTER_TARGET / Math.max(w, h);
    const cw = Math.round(w * scale);
    const ch = Math.round(h * scale);
    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Contexto de canvas indisponível.");
    ctx.drawImage(img, 0, 0, cw, ch);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

export function UploadSlot({ logo, onChange, fileName }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      const isSvg =
        file.type === "image/svg+xml" || /\.svg$/i.test(file.name);
      if (!isSvg && !file.type.startsWith("image/")) {
        setError("O arquivo precisa ser uma imagem.");
        return;
      }
      if (file.size > 6 * 1024 * 1024) {
        setError("A logo tem mais de 6MB. Exporte em tamanho menor.");
        return;
      }

      try {
        if (isSvg) {
          setConverting(true);
          const dataUrl = await rasterizeSvg(file);
          onChange(dataUrl, file.name.replace(/\.svg$/i, ".png"));
        } else {
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
            reader.readAsDataURL(file);
          });
          onChange(dataUrl, file.name);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Não foi possível carregar a imagem.");
      } finally {
        setConverting(false);
      }
    },
    [onChange]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) handleFile(f);
      }}
      className={`relative grid grid-cols-[auto_1fr] items-stretch gap-4 border border-ink/15 bg-paper-tint p-3 transition-colors ${
        dragOver ? "border-vermilion bg-paper-tint" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative flex h-32 w-32 items-center justify-center overflow-hidden border border-ink/15 bg-[radial-gradient(circle_at_30%_30%,#FAF6EE,#EDE6D6)]"
        aria-label="Upload logo"
      >
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt="Logo preview"
            className="h-full w-full object-contain p-3"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-ink-mute">
            <PlusGlyph />
            <span className="font-mono text-[9px] uppercase tracking-widest">
              Solte · Clique
            </span>
          </div>
        )}
        <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-ink/5 transition group-hover:ring-vermilion/50" />
      </button>

      <div className="flex min-w-0 flex-col justify-between py-1 pr-1">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
            Logo
          </div>
          <div className="mt-1 truncate font-serif text-[17px] leading-tight">
            {fileName ?? (
              <span className="italic text-ink-mute">
                Aguardando envio —
              </span>
            )}
          </div>
          <p className="mt-1 font-serif text-[13px] italic text-ink-mute">
            {converting
              ? "Rasterizando SVG…"
              : "PNG / JPG / WebP · SVG é convertido automaticamente."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="border border-ink/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-ink hover:bg-ink hover:text-paper transition-colors"
          >
            {logo ? "Trocar" : "Selecionar arquivo"}
          </button>
          {logo && (
            <button
              type="button"
              onClick={() => {
                onChange(null, null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="font-mono text-[10px] uppercase tracking-widest text-ink-mute hover:text-vermilion"
            >
              Remover
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {error && (
        <div className="col-span-2 border-t border-vermilion/30 pt-2 font-mono text-[10px] uppercase tracking-widest text-vermilion">
          ✕ {error}
        </div>
      )}
    </div>
  );
}

function PlusGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <path d="M12 4v16M4 12h16" />
    </svg>
  );
}
