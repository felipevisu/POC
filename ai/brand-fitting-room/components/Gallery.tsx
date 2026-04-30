"use client";

import { ResultCard, type Job } from "./ResultCard";

type Props = {
  jobs: Job[];
  onRetry: (id: string) => void;
};

export function Gallery({ jobs, onRetry }: Props) {
  if (jobs.length === 0) {
    return (
      <div className="border border-dashed border-ink-line bg-paper-tint p-10 text-center">
        <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
          A oficina está parada
        </div>
        <p className="mx-auto mt-2 max-w-md font-serif italic text-ink-mute">
          Envie uma logo, escolha algumas superfícies no briefing à esquerda e
          rode a oficina. Cada superfície aparece aqui, peça por peça.
        </p>
      </div>
    );
  }

  const summary = {
    pending: jobs.filter((j) => j.status === "pending" || j.status === "queued")
      .length,
    done: jobs.filter((j) => j.status === "done").length,
    error: jobs.filter((j) => j.status === "error").length,
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 font-mono text-[10px] uppercase tracking-widest">
        <span className="text-ink-mute">
          Folha — {jobs.length} peça{jobs.length === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-3 text-ink-mute">
          <span>
            <span className="text-ink num">{summary.done}</span> prontas
          </span>
          <span className="text-ink-line">·</span>
          <span>
            <span className="text-ink num">{summary.pending}</span> imprimindo
          </span>
          {summary.error > 0 && (
            <>
              <span className="text-ink-line">·</span>
              <span>
                <span className="text-vermilion num">{summary.error}</span>{" "}
                com erro
              </span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {jobs.map((job, i) => (
          <ResultCard key={job.id} job={job} index={i} onRetry={onRetry} />
        ))}
      </div>
    </div>
  );
}
