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

/** `days` days before a YYYY-MM-DD date (calendar math, DST-safe). */
export function daysBefore(date: string, days: number) {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d - days).toLocaleDateString('en-CA')
}

/** Range tab entered from a single-date tab: ends on the report date, starts 30 days earlier. */
export const rangeEndingOn = (reportDate: string) => ({ startDate: daysBefore(reportDate, 30), endDate: reportDate })
