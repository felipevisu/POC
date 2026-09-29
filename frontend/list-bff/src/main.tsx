import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApiError } from './api'
import { App } from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Fetch each filter combination once: revisiting a tab/page never refetches.
      // Reports for a given date don't change during a session; reload to refresh.
      staleTime: Infinity,
      // ponytail: cache grows with every filter combination; set a finite gcTime if sessions get long.
      gcTime: Infinity,
      // 4xx won't fix itself on retry; only retry network/5xx errors.
      retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 3,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
