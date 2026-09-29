/** Local YYYY-MM-DD, n days before today. */
export function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toLocaleDateString('en-CA')
}

/** Default for single-date tabs: yesterday. */
export const defaultReportDate = () => daysAgo(1)

/** Default for the range tab when the URL has no dates: the last 7 days. */
export const defaultRange = () => ({ startDate: daysAgo(7), endDate: daysAgo(0) })
