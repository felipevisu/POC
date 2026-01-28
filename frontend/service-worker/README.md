# Service Worker POC

A proof of concept demonstrating service worker implementation with React and Vite.

## What This POC Does

This project implements a **network-first caching strategy** with offline fallback:

1. **Service Worker Registration** (`index.html`): Registers the service worker when the browser supports it

2. **Caching Strategy** (`public/sw.js`):
   - Attempts to fetch from the network first
   - Caches successful responses (both same-origin and cross-origin/CORS)
   - Falls back to cached responses when offline or network fails

3. **Demo App** (`src/App.jsx`): Fetches random users from an external API (`randomuser.me`) to demonstrate that external API responses are also cached and available offline

## Key Concepts Demonstrated

- Service worker lifecycle events (`install`, `activate`, `fetch`)
- Network-first with cache fallback pattern
- Caching external API responses for offline access
- Using `skipWaiting()` and `clients.claim()` for immediate activation
