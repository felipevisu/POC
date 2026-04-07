import { useState, useEffect } from 'react'

function App() {
  const [withNonce, setWithNonce] = useState(false)
  const [withoutNonce, setWithoutNonce] = useState(false)

  useEffect(() => {
    setWithNonce(!!window.__WITH_NONCE)
    setWithoutNonce(!!window.__WITHOUT_NONCE)
  }, [])

  return (
    <>
      <section>
        <h1>CSP Demo</h1>
        <p>
          The backend injects two inline &lt;script&gt; tags into the HTML.
          One has a valid nonce, the other does not.
        </p>

        <div>
          <div>
            <span>{withNonce ? 'ALLOWED' : 'BLOCKED'}</span>
            <span>Inline script <strong>with</strong> nonce</span>
            <code>{'<script nonce="abc123">window.__WITH_NONCE = true;</script>'}</code>
          </div>

          <div>
            <span>{withoutNonce ? 'ALLOWED' : 'BLOCKED'}</span>
            <span>Inline script <strong>without</strong> nonce</span>
            <code>{'<script>window.__WITHOUT_NONCE = true;</script>'}</code>
          </div>
        </div>

        <p>Open DevTools Console to see the CSP violation error for the blocked script.</p>
      </section>
    </>
  )
}

export default App
