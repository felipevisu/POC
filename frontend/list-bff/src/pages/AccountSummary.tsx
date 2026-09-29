import { ListView } from '../components/ListView'
import type { Column } from '../components/DataTable'
import { CATEGORIES } from '../categories'
import { defaultReportDate } from '../dates'
import { money } from '../format'

type Summary = {
  id: string
  date: string
  account: string
  category: string
  opening: number
  credits: number
  debits: number
  closing: number
}

const columns: Column<Summary>[] = [
  { key: 'date', label: 'Date' },
  { key: 'account', label: 'Account' },
  { key: 'category', label: 'Category' },
  { key: 'opening', label: 'Opening balance', numeric: true, render: money },
  { key: 'credits', label: 'Credits', numeric: true, render: money },
  { key: 'debits', label: 'Debits', numeric: true, render: money },
  { key: 'closing', label: 'Closing balance', numeric: true, render: money },
]

export default function AccountSummary() {
  return (
    <ListView<Summary>
      title="Account Summary"
      endpoint="account-summary"
      columns={columns}
      categories={CATEGORIES}
      searchLabel="Account"
      dates={{ reportDate: defaultReportDate() }}
    />
  )
}
