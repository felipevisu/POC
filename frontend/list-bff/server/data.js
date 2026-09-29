// Mock downstream data. Seeded PRNG keeps it stable across restarts.
function rng(seed) {
  return () => (seed = (seed * 16807) % 2147483647) / 2147483647
}
const pick = (rand, arr) => arr[Math.floor(rand() * arr.length)]
const localIso = (d) => d.toLocaleDateString('en-CA') // YYYY-MM-DD, same convention as the client

function lastDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i + 1) // includes tomorrow to be safe around midnight
    return localIso(d)
  })
}

// Same categories for every list.
export const categories = ['Deposit', 'Withdrawal', 'Transfer', 'Fee', 'Interest']

export const dailyCash = (() => {
  const rand = rng(42)
  return lastDays(90).flatMap((date) =>
    Array.from({ length: 15 + Math.floor(rand() * 30) }, (_, i) => {
      const category = pick(rand, categories)
      const sign = category === 'Deposit' || category === 'Interest' ? 1 : -1
      return {
        id: `${date}-${i}`,
        date,
        account: `ACC-${1000 + Math.floor(rand() * 9000)}`,
        category,
        amount: Math.round(sign * rand() * 500000) / 100,
      }
    }),
  )
})()

export const outstandingPrincipal = (() => {
  const rand = rng(7)
  const borrowers = ['Acme Corp', 'Jane Doe', 'Globex', 'John Smith', 'Initech', 'Umbrella', 'Wayne Ent.', 'Stark Ind.']
  const loans = Array.from({ length: 25 }, (_, i) => ({
    loanId: `LN-${String(i + 1).padStart(4, '0')}`,
    borrower: pick(rand, borrowers),
    category: pick(rand, categories),
    principal: Math.round(10000 + rand() * 490000),
    rate: Math.round((2 + rand() * 10) * 100) / 100,
  }))
  // One snapshot per loan per day; principal amortizes backwards from today.
  return lastDays(90).flatMap((date, day) =>
    loans.map((l) => ({ id: `${date}-${l.loanId}`, date, ...l, principal: Math.round(l.principal * (1 + day * 0.002)) })),
  )
})()

export const accountSummary = (() => {
  const rand = rng(99)
  const accounts = Array.from({ length: 30 }, () => ({
    account: `ACC-${1000 + Math.floor(rand() * 9000)}`,
    category: pick(rand, categories),
    balance: Math.round(rand() * 20000000) / 100,
  }))
  // Oldest day first so each day's opening balance is the previous day's closing.
  return lastDays(90)
    .reverse()
    .flatMap((date) =>
      accounts.map((a) => {
        const credits = Math.round(rand() * 500000) / 100
        const debits = Math.round(rand() * Math.min(500000, a.balance * 100)) / 100
        const opening = a.balance
        a.balance = Math.round((opening + credits - debits) * 100) / 100
        return { id: `${date}-${a.account}`, date, account: a.account, category: a.category, opening, credits, debits, closing: a.balance }
      }),
    )
})()
