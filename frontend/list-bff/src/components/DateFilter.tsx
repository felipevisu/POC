import { useDateParams, type DateDefaults } from '../hooks/useDateParams'

export function DateFilter({ defaults }: { defaults: DateDefaults }) {
  const { single, reportDate, startDate, endDate, setDates } = useDateParams(defaults)

  if (single)
    return (
      <label>
        Report date
        <input type="date" value={reportDate} onChange={(e) => e.target.value && setDates({ reportDate: e.target.value })} />
      </label>
    )

  return (
    <>
      <label>
        Start date
        <input type="date" value={startDate} max={endDate} onChange={(e) => e.target.value && setDates({ startDate: e.target.value })} />
      </label>
      <label>
        End date
        <input type="date" value={endDate} min={startDate} onChange={(e) => e.target.value && setDates({ endDate: e.target.value })} />
      </label>
    </>
  )
}
