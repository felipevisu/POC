import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const API_CHAT = '/api/chat'
const HISTORY_LIMIT = 10  // last N exchanges fed to Claude

function Citations({ citations }) {
  const [open, setOpen] = useState(false)
  if (!citations || citations.length === 0) return null

  return (
    <div className="citations">
      <button className="citations-head" onClick={() => setOpen(o => !o)}>
        <span className="citations-caret">{open ? '▾' : '▸'}</span>
        <span>Sources</span>
        <span className="citations-count">{citations.length}</span>
      </button>
      {open && (
        <div className="citations-list">
          {citations.map(c => (
            <div key={c.id} className="citation">
              <div className="citation-meta">
                <span className="citation-file">{c.filename}</span>
                {Array.isArray(c.page_numbers) && c.page_numbers.length > 0 && (
                  <span className="citation-page">p.{c.page_numbers.join(', ')}</span>
                )}
                <span className="citation-sim">
                  {(c.similarity * 100).toFixed(1)}%
                </span>
              </div>
              <div className="citation-text">{c.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Message({ msg }) {
  const renderAsMarkdown = msg.role === 'assistant' && !msg.error
  return (
    <div className={`msg ${msg.role}${msg.error ? ' error' : ''}`}>
      <span className="msg-role">{msg.role === 'user' ? 'You' : 'Claude'}</span>
      <div className="msg-bubble">
        {renderAsMarkdown ? (
          <div className="markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {msg.content}
            </ReactMarkdown>
          </div>
        ) : (
          msg.content
        )}
      </div>
      {msg.role === 'assistant' && <Citations citations={msg.citations} />}
    </div>
  )
}

export default function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [model, setModel] = useState('')
  const scrollRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, pending])

  async function send() {
    const text = input.trim()
    if (!text || pending) return

    const userMsg = { role: 'user', content: text }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setPending(true)

    // Build history sent to Claude (exclude the freshly added user msg, server adds it)
    const history = messages
      .slice(-HISTORY_LIMIT * 2)
      .map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch(API_CHAT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, k: 5 }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }))
        throw new Error(err.detail || `HTTP ${res.status}`)
      }
      const data = await res.json()
      if (data.model) setModel(data.model)
      setMessages([
        ...next,
        {
          role: 'assistant',
          content: data.answer,
          citations: data.citations || [],
        },
      ])
    } catch (e) {
      setMessages([
        ...next,
        { role: 'assistant', content: e.message, error: true, citations: [] },
      ])
    } finally {
      setPending(false)
    }
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="chat">
      <header className="chat-header">
        <div className="brand">
          <span className="brand-dot" />
          <span>RAG Chat</span>
        </div>
        {model && <span className="model-tag">{model}</span>}
      </header>

      <div className="messages" ref={scrollRef}>
        {messages.length === 0 && !pending && (
          <div className="empty">
            <div className="empty-icon">✦</div>
            <p>Ask anything about the indexed documents.</p>
            <p className="hint">
              e.g. "How do I cancel my subscription?" · "What if my package is stolen?"
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <Message key={i} msg={m} />
        ))}
        {pending && (
          <div className="thinking">
            <span className="dots"><span /><span /><span /></span>
            <span>Retrieving + generating…</span>
          </div>
        )}
      </div>

      <form
        className="composer"
        onSubmit={e => { e.preventDefault(); send() }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Ask a question…"
          disabled={pending}
          rows={1}
          autoFocus
        />
        <button type="submit" disabled={pending || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  )
}
