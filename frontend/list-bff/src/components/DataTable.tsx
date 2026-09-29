import type { ReactNode } from 'react'

export type Column<T> = {
  key: keyof T & string
  label: string
  numeric?: boolean
  render?: (value: T[keyof T], row: T) => ReactNode
}

export function DataTable<T extends { id: string }>({ rows, columns }: { rows: T[]; columns: Column<T>[] }) {
  if (rows.length === 0) return <p className="empty">No results for these filters.</p>
  return (
    <table>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} className={c.numeric ? 'num' : undefined}>{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            {columns.map((c) => (
              <td key={c.key} className={c.numeric ? 'num' : undefined}>
                {c.render ? c.render(row[c.key], row) : String(row[c.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
