"use client";

export function Header({ date }: { date: string }) {
  return (
    <header className="border-b border-ink/15">
      <div className="mx-auto max-w-[1480px] px-6 lg:px-10">
        <div className="flex items-baseline justify-between gap-6 pt-5 font-mono text-[10px] uppercase tracking-widest text-ink-mute">
          <span>Provador № 01</span>
          <span className="hidden sm:inline">
            Edição / <span className="text-ink">{date}</span>
          </span>
          <span className="hidden md:inline">
            Espaço —{" "}
            <span className="text-ink">Provas de Marca</span>
          </span>
          <span>OpenRouter / Gemini 3.1 Flash Image</span>
        </div>

        <div className="grid grid-cols-12 items-end gap-6 pb-5 pt-3">
          <div className="col-span-12 lg:col-span-8">
            <h1 className="font-display text-[clamp(34px,4.6vw,58px)] leading-[1.04] tracking-tight">
              Provador{" "}
              <span className="italic text-vermilion">de marcas.</span>
            </h1>
          </div>
          <div className="col-span-12 lg:col-span-4 lg:pb-1">
            <p className="font-serif text-[14px] leading-snug text-ink-soft">
              Experimente sua logo em dezoito superfícies — algodão, kraft,
              couro, vidro, luz.
            </p>
            <div className="mt-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ink-mute">
              <span className="inline-block h-[6px] w-[6px] rounded-full bg-vermilion blink" />
              <span>Espaço ativo</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
