// Mock downstream services, each with its own date contract. The BFF adapts to them.
import { query } from './query.js'
import { accountSummary, dailyCash, outstandingPrincipal } from './data.js'

const latency = () => new Promise((r) => setTimeout(r, 300)) // so transitions are visible

export async function dailyCashService({ reportDate, ...filters }) {
  await latency()
  return query(dailyCash, { from: reportDate, to: reportDate, searchFields: ['account'], ...filters })
}

export async function accountSummaryService({ reportDate, ...filters }) {
  await latency()
  return query(accountSummary, { from: reportDate, to: reportDate, searchFields: ['account'], ...filters })
}

export async function outstandingPrincipalService({ startDate, endDate, ...filters }) {
  await latency()
  return query(outstandingPrincipal, { from: startDate, to: endDate, ...filters })
}
