import { Suspense } from 'react'
import type { DateDefaults } from '../hooks/useDateParams'
import { useListQuery } from '../hooks/useListQuery'
import { CategoryFilter } from './CategoryFilter'
import { DataTable, type Column } from './DataTable'
import { DateFilter } from './DateFilter'
import { ErrorBoundary } from './ErrorBoundary'
import { PageSizeSelect } from './PageSizeSelect'
import { SearchFilter } from './SearchFilter'
import { Pagination } from './Pagination'

type Props<T> = {
  title: string
  endpoint: string
  columns: Column<T>[]
  categories: readonly string[]
  /** Label for the text search; omit to hide it (BFF decides which fields it searches). */
  searchLabel?: string
  /** `{ reportDate }` for a single date, `{ startDate, endDate }` for a range; values are the defaults. */
  dates: DateDefaults
}

/**
 * Filters live in the URL query string. Each filter subscribes
 * only to its own key, so changing one filter re-renders that filter + the results — never the siblings.
 */
export function ListView<T extends { id: string }>({ title, endpoint, columns, categories, searchLabel, dates }: Props<T>) {
  return (
    <>
      <h1>{title}</h1>
      <div className="filters">
        {searchLabel && <SearchFilter label={searchLabel} />}
        <DateFilter defaults={dates} />
        <PageSizeSelect />
        <CategoryFilter options={categories} />
      </div>
      <ErrorBoundary>
        <Suspense fallback={<p className="muted">Loading…</p>}>
          <Results endpoint={endpoint} columns={columns} dates={dates} searchable={!!searchLabel} />
        </Suspense>
      </ErrorBoundary>
    </>
  )
}

function Results<T extends { id: string }>({
  endpoint,
  columns,
  dates,
  searchable,
}: Pick<Props<T>, 'endpoint' | 'columns' | 'dates'> & { searchable: boolean }) {
  const { data, isStale } = useListQuery<T>(endpoint, dates, searchable)
  return (
    <div className="results" aria-busy={isStale}>
      <DataTable rows={data.items} columns={columns} />
      <Pagination total={data.total} />
    </div>
  )
}
