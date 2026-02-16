"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h1 className="title">Price Tracker</h1>
      <p className="subtitle">
        Paste a product URL to extract its name and price.
      </p>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="url"
          required
          placeholder="https://www.amazon.com.br/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          className="input"
        />
        <button type="submit" disabled={loading} className="button">
          {loading ? "Extracting..." : "Extract"}
        </button>
      </form>

      {loading && (
        <p className="loading-text">
          Scraping page and extracting price... this may take a moment.
        </p>
      )}

      {error && <p className="error-text">Error: {error}</p>}

      {result && (
        <div className="result-card">
          <p className="result-label">Product</p>
          <p className="result-product">{result.product}</p>
          <p className="result-label">Price</p>
          <p className="result-price">{result.price}</p>
        </div>
      )}
    </div>
  );
}
