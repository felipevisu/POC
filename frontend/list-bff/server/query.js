// Filter by date range + categories (empty = all) + text search, then paginate.
export function query(rows, { from, to, categories, search = '', searchFields = [], page, pageSize }) {
  const needle = search.trim().toLowerCase()
  const filtered = rows.filter(
    (r) =>
      r.date >= from &&
      r.date <= to &&
      (categories.length === 0 || categories.includes(r.category)) &&
      (!needle || searchFields.length === 0 || searchFields.some((f) => String(r[f]).toLowerCase().includes(needle))),
  )
  const start = page * pageSize // page is zero-based
  return { items: filtered.slice(start, start + pageSize), total: filtered.length, page, pageSize }
}
