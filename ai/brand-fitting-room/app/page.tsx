"use client";

import { useCallback, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { SectionLabel } from "@/components/SectionLabel";
import { UploadSlot } from "@/components/UploadSlot";
import { ApplicationPicker } from "@/components/ApplicationPicker";
import { PromptEditor } from "@/components/PromptEditor";
import { ParamControls } from "@/components/ParamControls";
import { Gallery } from "@/components/Gallery";
import {
  APPLICATIONS,
  type AspectRatio,
  type ImageSize,
} from "@/lib/applications";
import type { Job } from "@/components/ResultCard";

export default function Page() {
  const [logo, setLogo] = useState<string | null>(null);
  const [logoName, setLogoName] = useState<string | null>(null);

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(["business-card", "embossed-leather", "illuminated-sign"]),
  );
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [imageSize, setImageSize] = useState<ImageSize>("2K");
  const [perApplicationRatio, setPerApplicationRatio] = useState(true);

  const [jobs, setJobs] = useState<Record<string, Job>>({});
  const [busy, setBusy] = useState(false);

  const selectedIds = useMemo(
    () => APPLICATIONS.filter((a) => selected.has(a.id)).map((a) => a.id),
    [selected],
  );

  const orderedJobs = useMemo(
    () => APPLICATIONS.filter((a) => jobs[a.id]).map((a) => jobs[a.id]),
    [jobs],
  );

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(
    () => setSelected(new Set(APPLICATIONS.map((a) => a.id))),
    [],
  );
  const clearAll = useCallback(() => setSelected(new Set()), []);
  const selectCategory = useCallback((cat: string) => {
    setSelected((prev) => {
      const inCat = APPLICATIONS.filter((a) => a.category === cat);
      const allSelected = inCat.every((a) => prev.has(a.id));
      const next = new Set(prev);
      for (const a of inCat) {
        if (allSelected) next.delete(a.id);
        else next.add(a.id);
      }
      return next;
    });
  }, []);

  const updatePrompt = useCallback((id: string, value: string) => {
    setOverrides((prev) => ({ ...prev, [id]: value }));
  }, []);
  const resetPrompt = useCallback((id: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);
  const resetAllPrompts = useCallback(() => setOverrides({}), []);

  const updateParams = useCallback(
    (n: {
      aspectRatio?: AspectRatio;
      imageSize?: ImageSize;
      perApplicationRatio?: boolean;
    }) => {
      if (n.aspectRatio !== undefined) setAspectRatio(n.aspectRatio);
      if (n.imageSize !== undefined) setImageSize(n.imageSize);
      if (n.perApplicationRatio !== undefined)
        setPerApplicationRatio(n.perApplicationRatio);
    },
    [],
  );

  const ratioFor = useCallback(
    (id: string): AspectRatio => {
      if (!perApplicationRatio) return aspectRatio;
      const app = APPLICATIONS.find((a) => a.id === id);
      return (app?.suggestedRatio ?? aspectRatio) as AspectRatio;
    },
    [aspectRatio, perApplicationRatio],
  );

  const promptFor = useCallback(
    (id: string) => {
      if (overrides[id] !== undefined) return overrides[id];
      const app = APPLICATIONS.find((a) => a.id === id);
      return app?.defaultPrompt ?? "";
    },
    [overrides],
  );

  const runOne = useCallback(
    async (id: string, signal?: AbortSignal) => {
      if (!logo) return;
      const ratio = ratioFor(id);
      const prompt = promptFor(id);

      setJobs((j) => ({
        ...j,
        [id]: {
          id,
          status: "pending",
          prompt,
          aspectRatio: ratio,
          imageSize,
          startedAt: Date.now(),
        },
      }));

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            logo,
            prompt,
            aspectRatio: ratio,
            imageSize,
          }),
          signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Generation failed");

        setJobs((j) => ({
          ...j,
          [id]: {
            ...j[id],
            status: "done",
            url: data.url,
            finishedAt: Date.now(),
          },
        }));
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setJobs((j) => ({
          ...j,
          [id]: {
            ...j[id],
            status: "error",
            error: err instanceof Error ? err.message : "Generation failed",
            finishedAt: Date.now(),
          },
        }));
      }
    },
    [logo, ratioFor, promptFor, imageSize],
  );

  const runAll = useCallback(async () => {
    if (!logo || selectedIds.length === 0) return;
    setBusy(true);

    setJobs((j) => {
      const next = { ...j };
      for (const id of selectedIds) {
        next[id] = {
          id,
          status: "queued",
          prompt: promptFor(id),
          aspectRatio: ratioFor(id),
          imageSize,
        };
      }
      return next;
    });

    await Promise.allSettled(selectedIds.map((id) => runOne(id)));
    setBusy(false);
  }, [logo, selectedIds, runOne, promptFor, ratioFor, imageSize]);

  const retry = useCallback((id: string) => runOne(id), [runOne]);

  const canRun = !!logo && selectedIds.length > 0 && !busy;

  return (
    <div className="min-h-screen">
      <Header date={new Date().toISOString().slice(0, 10)} />

      <main className="mx-auto max-w-[1480px] px-6 lg:px-10">
        <div className="grid grid-cols-12 gap-8 py-8">
          {/* LEFT: Brief */}
          <aside className="col-span-12 lg:col-span-5 xl:col-span-4">
            <div className="sticky top-6 space-y-7">
              <div>
                <SectionLabel num="01" title="Marca" caption="A logo." />
                <UploadSlot
                  logo={logo}
                  fileName={logoName}
                  onChange={(d, n) => {
                    setLogo(d);
                    setLogoName(n);
                  }}
                />
              </div>

              <div>
                <SectionLabel
                  num="02"
                  title="Superfícies"
                  caption="Onde a marca aparece."
                />
                <ApplicationPicker
                  selected={selected}
                  onToggle={toggle}
                  onClear={clearAll}
                  onSelectAll={selectAll}
                  onSelectCategory={selectCategory}
                />
              </div>

              <div>
                <SectionLabel num="03" title="Briefing" caption="Por superfície." />
                <PromptEditor
                  selectedIds={selectedIds}
                  overrides={overrides}
                  onChange={updatePrompt}
                  onResetOne={resetPrompt}
                  onResetAll={resetAllPrompts}
                />
              </div>

              <div>
                <SectionLabel num="04" title="Especificações" caption="Formato e tamanho." />
                <ParamControls
                  aspectRatio={aspectRatio}
                  imageSize={imageSize}
                  perApplicationRatio={perApplicationRatio}
                  onChange={updateParams}
                />
              </div>

              <div className="sticky bottom-4 z-10 -mx-2 mt-4 bg-paper/85 px-2 pt-3 backdrop-blur-md">
                <button
                  type="button"
                  onClick={runAll}
                  disabled={!canRun}
                  className={`group relative w-full overflow-hidden border border-ink py-3.5 font-mono text-[12px] uppercase tracking-widest transition-all ${
                    canRun
                      ? "bg-ink text-paper hover:bg-vermilion hover:border-vermilion"
                      : "cursor-not-allowed border-ink/30 bg-paper-tint text-ink-mute"
                  }`}
                >
                  <span className="relative z-10">
                    {busy
                      ? "Imprimindo…"
                      : !logo
                        ? "Aguardando logo"
                        : selectedIds.length === 0
                          ? "Selecione pelo menos uma superfície"
                          : `Rodar oficina · ${selectedIds.length} peça${selectedIds.length === 1 ? "" : "s"}`}
                  </span>
                </button>
                <p className="mt-2 text-center font-serif text-[12px] italic text-ink-mute">
                  As gerações são feitas em paralelo. Cada peça é independente.
                </p>
              </div>
            </div>
          </aside>

          {/* RIGHT: Gallery */}
          <section className="col-span-12 lg:col-span-7 xl:col-span-8">
            <SectionLabel
              num="05"
              title="Folha de Prova"
              caption="As peças conforme imprimem."
              right={
                orderedJobs.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setJobs({})}
                    className="font-mono text-[10px] uppercase tracking-widest text-ink-mute hover:text-vermilion"
                  >
                    Limpar folha
                  </button>
                ) : null
              }
            />
            <Gallery jobs={orderedJobs} onRetry={retry} />
          </section>
        </div>

        <footer className="border-t border-ink/15 py-8 font-mono text-[10px] uppercase tracking-widest text-ink-mute">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <span>
              Provador de Marcas · Feito com OpenRouter ·
              google/gemini-3.1-flash-image-preview
            </span>
            <span>
              <span className="ticker inline-block h-[1px] w-12 align-middle" />{" "}
              Fim da edição
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
