import { use, useState, Suspense, useDeferredValue } from "react";
import { fetchData } from "./data";

function SearchResults({ query }: { query: string }) {
  if (!query) return null;
  const albums: { id: string; title: string; year: number }[] = use(
    fetchData(`/search?q=${query}`)
  );

  if (albums.length === 0) {
    return <p>Nothing found</p>;
  }

  return (
    <ul>
      {query}
      {albums.map((album) => (
        <li key={album.id}>
          {album.title} ({album.year})
        </li>
      ))}
    </ul>
  );
}

export default function Example() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  return (
    <>
      <label>Search albumns</label>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <Suspense fallback={<h2>Loading...</h2>}>
        <SearchResults query={deferredQuery} />
      </Suspense>
    </>
  );
}
