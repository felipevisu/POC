export function SectionLabel({
  num,
  title,
  caption,
  right,
}: {
  num: string;
  title: string;
  caption?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[11px] uppercase tracking-widest text-vermilion">
          {num}
        </span>
        <h2 className="font-display text-[26px] leading-none">{title}</h2>
        {caption && (
          <span className="hidden font-serif italic text-ink-mute md:inline">
            — {caption}
          </span>
        )}
      </div>
      <div className="flex-1 self-center border-t border-dotted border-ink-line" />
      {right}
    </div>
  );
}
