# SWR Infinite Scroll

SWR providers this custom hook `useSWRInfinite` that accepts two properties `getKey` and `fetcher`, by implementing the first one I can iterate to the next page but preserving the previous data.

The hook returns a `setSize` method which I can use to increment the page, it will trigger a new data fetch.