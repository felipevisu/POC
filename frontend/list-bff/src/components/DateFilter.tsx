import { useDateParams, type DateDefaults } from '../hooks/useDateParams'
import { useDraft } from '../hooks/useDraft'

export function DateFilter({ defaults }: { defaults: DateDefaults }) {
  const { single, reportDate, startDate, endDate, setDates } = useDateParams(defaults)

  if (single) return <DateInput label="Report date" value={reportDate} onCommit={(reportDate) => setDates({ reportDate })} />

  return (
    <>
      <DateInput label="Start date" value={startDate} max={endDate} onCommit={(startDate) => setDates({ startDate })} />
      <DateInput label="End date" value={endDate} min={startDate} onCommit={(endDate) => setDates({ endDate })} />
    </>
  )
}

type DateInputProps = { label: string; value: string; min?: string; max?: string; onCommit: (date: string) => void }

// Typing a date fires a change per keystroke with in-between values (year 0002 → 0020 → 0202
// → 2025, day 01 → 15). Keep the typing local; only a complete, in-range date that has
// stopped changing (or is left via blur) becomes the filter, so no fetch per keystroke.
function DateInput({ label, value, min, max, onCommit }: DateInputProps) {
  const isValid = (d: string) => /^[1-9]\d{3}-\d{2}-\d{2}$/.test(d) && (!min || d >= min) && (!max || d <= max)
  const { draft, setDraft, flush } = useDraft(value, onCommit, 500, isValid)
  return (
    <label>
      {label}
      <input type="date" value={draft} min={min} max={max} onChange={(e) => setDraft(e.target.value)} onBlur={flush} />
    </label>
  )
}
