import axios from 'axios'
import { QueryClient } from '@tanstack/react-query'

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

export const api = axios.create({ baseURL: '/api' })

// Surface the BFF's `{ error }` message + status; leave cancellations/network errors untouched.
api.interceptors.response.use(undefined, (e) =>
  Promise.reject(e.response ? new ApiError(e.response.data?.error ?? e.message, e.response.status) : e),
)

/** The app's React Query setup (a factory so tests get the same behavior with a fresh cache). */
export const createQueryClient = () =>
  new QueryClient({
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
