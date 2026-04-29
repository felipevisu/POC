"use client";

import { APPLICATIONS } from "@/lib/applications";

export type JobStatus = "queued" | "pending" | "done" | "error";

export type Job = {
  id: string;
  status: JobStatus;
  url?: string;
  error?: string;
  prompt: string;
  aspectRatio: string;
  imageSize: string;
  startedAt?: number;
  finishedAt?: number;
};

export function ResultCard({
  job,
  index,
  onRetry,
}: {
  job: Job;
  index: number;
  onRetry: (id: string) => void;
}) {
  const app = APPLICATIONS.find((a) => a.id === job.id);
  if (!app) return null;

  const ms =
    job.startedAt && job.finishedAt ? job.finishedAt - job.startedAt : null;

  const ratioParts = job.aspectRatio.split(":").map(Number);
  const aspect = ratioParts.length === 2 ? ratioParts[0] / ratioParts[1] : 1;

  return (
    <article
      className="rise group flex flex-col border border-ink/15 bg-paper-tint"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <header className="flex items-baseline justify-between gap-3 border-b border-ink/15 px-3 py-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-vermilion num">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="font-display text-[20px] leading-none">
            {app.name}
          </h3>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-widest text-ink-mute">
          {app.category}
        </span>
      </header>

      <div
        className="relative overflow-hidden bg-[radial-gradient(circle_at_30%_30%,#FAF6EE,#E8E1D1)]"
        style={{ aspectRatio: aspect }}
      >
        {job.status === "queued" && (
          <Placeholder label="Na fila" subtle />
        )}
        {job.status === "pending" && (
          <>
            <div className="absolute inset-0 skeleton" />
            <div className="absolute inset-0 scanline" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 font-mono text-[10px] uppercase tracking-widest text-ink-soft">
              <span>Renderizando</span>
              <span className="text-ink-mute">{app.name}</span>
              <Spinner />
            </div>
          </>
        )}
        {job.status === "done" && job.url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={job.url}
            alt={`${app.name} mockup`}
            className="h-full w-full object-cover"
          />
        )}
        {job.status === "error" && (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
            <span className="font-mono text-[10px] uppercase tracking-widest text-vermilion">
              Falhou
            </span>
            <span className="font-serif text-[13px] italic text-ink-soft">
              {job.error ?? "Erro desconhecido"}
            </span>
            <button
              type="button"
              onClick={() => onRetry(job.id)}
              className="mt-1 border border-vermilion px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-vermilion hover:bg-vermilion hover:text-paper transition-colors"
            >
              Tentar de novo
            </button>
          </div>
        )}
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-ink/15 px-3 py-2 font-mono text-[10px] uppercase tracking-widest">
        <div className="flex items-center gap-3 text-ink-mute num">
          <span>{job.aspectRatio}</span>
          <span className="text-ink-line">·</span>
          <span>{job.imageSize}</span>
          {ms !== null && (
            <>
              <span className="text-ink-line">·</span>
              <span>{(ms / 1000).toFixed(1)}s</span>
            </>
          )}
        </div>
        {job.status === "done" && job.url && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onRetry(job.id)}
              className="text-ink hover:text-vermilion"
              title="Refazer"
            >
              ↻ Refazer
            </button>
            <a
              href={job.url}
              download={`${job.id}.png`}
              className="text-ink hover:text-vermilion"
            >
              ↓ Baixar
            </a>
          </div>
        )}
      </footer>
    </article>
  );
}

function Placeholder({ label, subtle }: { label: string; subtle?: boolean }) {
  return (
    <div
      className={`flex h-full items-center justify-center font-mono text-[10px] uppercase tracking-widest ${
        subtle ? "text-ink-mute" : "text-ink-soft"
      }`}
    >
      {label}
    </div>
  );
}

function Spinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      className="mt-1"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" opacity=".18" />
      <path d="M21 12a9 9 0 0 0-9-9">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="1.1s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}
