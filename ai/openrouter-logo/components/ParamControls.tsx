"use client";

import {
  ASPECT_RATIOS,
  IMAGE_SIZES,
  type AspectRatio,
  type ImageSize,
} from "@/lib/applications";

type Props = {
  aspectRatio: AspectRatio;
  imageSize: ImageSize;
  perApplicationRatio: boolean;
  onChange: (next: {
    aspectRatio?: AspectRatio;
    imageSize?: ImageSize;
    perApplicationRatio?: boolean;
  }) => void;
};

export function ParamControls({
  aspectRatio,
  imageSize,
  perApplicationRatio,
  onChange,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 border border-ink/15 bg-paper-tint p-4 sm:grid-cols-2">
      <div>
        <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-ink-mute">
          <span>Proporção</span>
          <label className="flex items-center gap-1.5 text-ink">
            <input
              type="checkbox"
              checked={perApplicationRatio}
              onChange={(e) =>
                onChange({ perApplicationRatio: e.target.checked })
              }
              className="h-3 w-3 accent-vermilion"
            />
            <span>Usar sugerida por superfície</span>
          </label>
        </div>
        <div
          className={`flex flex-wrap gap-1.5 ${
            perApplicationRatio ? "opacity-40" : ""
          }`}
        >
          {ASPECT_RATIOS.map((r) => (
            <button
              key={r}
              type="button"
              disabled={perApplicationRatio}
              onClick={() => onChange({ aspectRatio: r })}
              className={`flex items-center gap-2 border px-2.5 py-1.5 font-mono text-[11px] tracking-widest transition-colors ${
                aspectRatio === r && !perApplicationRatio
                  ? "border-vermilion bg-vermilion text-paper"
                  : "border-ink/15 hover:border-ink/40"
              }`}
            >
              <RatioBox ratio={r} active={aspectRatio === r && !perApplicationRatio} />
              {r}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-mute">
          Resolução
        </div>
        <div className="inline-flex border border-ink/15">
          {IMAGE_SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange({ imageSize: s })}
              className={`px-4 py-1.5 font-mono text-[11px] tracking-widest transition-colors ${
                imageSize === s
                  ? "bg-ink text-paper"
                  : "hover:bg-paper"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="mt-2 font-serif text-[12px] italic text-ink-mute">
          Resoluções maiores demoram mais e gastam mais créditos.
        </p>
      </div>
    </div>
  );
}

function RatioBox({ ratio, active }: { ratio: string; active: boolean }) {
  const [w, h] = ratio.split(":").map(Number);
  const max = 14;
  const scale = max / Math.max(w, h);
  return (
    <span
      className={`inline-block border ${
        active ? "border-paper" : "border-ink/40"
      }`}
      style={{
        width: `${w * scale}px`,
        height: `${h * scale}px`,
      }}
    />
  );
}
