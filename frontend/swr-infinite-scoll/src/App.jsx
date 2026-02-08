import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import useSWRInfinite from 'swr/infinite'

const fetcher = (url) => fetch(url).then(r => r.json())

function App() {
  const getKey = (pageIndex, previous) => {
    if (previous && !previous.hasMore) return null
    if (pageIndex === 0) return 'http://localhost:8080/documents?limit=5'
    return `http://localhost:8080/documents?cursor=${previous.nextCursor}&limit=20`
  }

  const { data, size, setSize, error, isLoading } = useSWRInfinite(
    getKey,
    fetcher
  )

  const items = data ? data.flatMap(page => page.data) : []
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')
  const isReachingEnd = data && !data[data.length - 1]?.hasMore

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
      
      {!isReachingEnd && (
        <button 
          disabled={isLoadingMore}
          onClick={() => setSize(size + 1)}
        >
          {isLoadingMore ? 'Loading...' : 'Load More'}
        </button>
      )}
      
      {error && <div>Error loading data</div>}
    </div>
  )
}

export default App
