import express from 'express'
import { categories as knownCategories } from './data.js'
import { accountSummaryService, dailyCashService, outstandingPrincipalService } from './downstream.js'

// `dates` is each list's date contract; the frontend sends the same param names.
const lists = {
  'daily-cash': { service: dailyCashService, dates: 'reportDate' },
  'account-summary': { service: accountSummaryService, dates: 'reportDate' },
  'outstanding-principal': { service: outstandingPrincipalService, dates: 'range' },
}
const DATE = /^\d{4}-\d{2}-\d{2}$/
const int = (v, def, min, max) => Math.min(max, Math.max(min, Number.parseInt(v, 10) || def))

const app = express()

app.param('list', (req, res, next, name) => {
  req.list = lists[name]
  req.list ? next() : res.status(404).json({ error: `Unknown list ${name}` })
})

app.get('/api/:list', async (req, res) => {
  const { reportDate, startDate, endDate, categories = '', search = '', page, pageSize } = req.query

  let dates
  if (req.list.dates === 'reportDate') {
    if (!DATE.test(reportDate)) return res.status(400).json({ error: 'reportDate must be YYYY-MM-DD' })
    dates = { reportDate }
  } else {
    if (!DATE.test(startDate) || !DATE.test(endDate))
      return res.status(400).json({ error: 'startDate and endDate must be YYYY-MM-DD' })
    if (startDate > endDate) return res.status(400).json({ error: 'startDate must be on or before endDate' })
    dates = { startDate, endDate }
  }

  res.json(
    await req.list.service({
      ...dates,
      categories: String(categories).split(',').filter((c) => knownCategories.includes(c)),
      search: String(search).slice(0, 100),
      page: int(page, 0, 0, 1e6),
      pageSize: int(pageSize, 10, 1, 100),
    }),
  )
})

app.listen(3001, () => console.log('BFF on http://localhost:3001'))
