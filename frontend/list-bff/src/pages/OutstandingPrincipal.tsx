import { ListView } from '../components/ListView'
import type { Column } from '../components/DataTable'
import { CATEGORIES } from '../categories'
import { defaultRange } from '../dates'
import { money } from '../format'

type Loan = { id: string; date: string; loanId: string; borrower: string; category: string; principal: number; rate: number }

const columns: Column<Loan>[] = [
  { key: 'date', label: 'Date' },
  { key: 'loanId', label: 'Loan' },
  { key: 'borrower', label: 'Borrower' },
  { key: 'category', label: 'Category' },
  { key: 'rate', label: 'Rate', numeric: true, render: (v) => `${v}%` },
  { key: 'principal', label: 'Outstanding principal', numeric: true, render: money },
]

export default function OutstandingPrincipal() {
  return (
    <ListView<Loan>
      title="Outstanding Principal"
      endpoint="outstanding-principal"
      columns={columns}
      categories={CATEGORIES}
      dates={defaultRange()}
    />
  )
}
