import axios from 'axios'

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
