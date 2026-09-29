import { ListView } from '../components/ListView'
import type { Column } from '../components/DataTable'
import { CATEGORIES } from '../categories'
import { defaultReportDate } from '../dates'
import { money } from '../format'

type Transaction = { id: string; date: string; account: string; category: string; amount: number }

const columns: Column<Transaction>[] = [
  { key: 'date', label: 'Date' },
  { key: 'account', label: 'Account' },
  { key: 'category', label: 'Category' },
  { key: 'amount', label: 'Amount', numeric: true, render: money },
]

export default function DailyCash() {
  return (
    <ListView<Transaction>
      title="Daily Cash Transactions"
      endpoint="daily-cash"
      columns={columns}
      categories={CATEGORIES}
      searchLabel="Account"
      dates={{ reportDate: defaultReportDate() }}
    />
  )
}
