'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const HISTORY_LIMIT = 10

interface Chunk {
  id: number
  filename: string
  text: string
  page_numbers: number[] | null
  similarity: number
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  citations?: Chunk[]
  error?: boolean
}

// ---------------------------------------------------------------- loan form

type Purpose = 'auto' | 'health' | 'house' | 'work' | 'education' | 'other'

interface PurposeDef { value: Purpose; label: string; icon: string; apr: number }

const PURPOSES: PurposeDef[] = [
  { value: 'auto', label: 'Auto', icon: '🚗', apr: 7.49 },
  { value: 'health', label: 'Health', icon: '🏥', apr: 11.99 },
  { value: 'house', label: 'House', icon: '🏠', apr: 6.5 },
  { value: 'work', label: 'Work / Business', icon: '💼', apr: 9.99 },
  { value: 'education', label: 'Education', icon: '🎓', apr: 8.5 },
  { value: 'other', label: 'Other', icon: '✨', apr: 12.99 },
]

const TERMS = [24, 36, 48, 64] // months

const AMOUNT_MIN = 1000
const AMOUNT_MAX = 100000
const AMOUNT_STEP = 500

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function monthlyPayment(principal: number, annualRatePct: number, months: number): number {
  if (!principal || !months) return 0
  const r = annualRatePct / 100 / 12
  if (r === 0) return principal / months
  const pow = Math.pow(1 + r, months)
  return (principal * r * pow) / (pow - 1)
}

function composeQuestion(amount: number, term: number, p: PurposeDef, installment: number): string {
  return [
    `I'd like a ${p.label.toLowerCase()} loan of ${currency(amount)} over ${term} months`,
    `(estimated installment ${currency(installment)}/mo at ${p.apr}% APR).`,
    `Based on the loan policies, am I likely eligible, what are the key requirements,`,
    `and what should I know about rates, fees, and repayment?`,
  ].join(' ')
}

function LoanPanel({ onSubmit, disabled }: { onSubmit: (q: string) => void; disabled: boolean }) {
  const [amount, setAmount] = useState(25000)
  const [term, setTerm] = useState(48)
  const [purpose, setPurpose] = useState<Purpose>('auto')

  const purposeDef = PURPOSES.find(p => p.value === purpose)!

  const installment = useMemo(
    () => monthlyPayment(amount, purposeDef.apr, term),
    [amount, purposeDef.apr, term],
  )
  const totalPaid = installment * term
  const totalInterest = totalPaid - amount

  const pct = ((amount - AMOUNT_MIN) / (AMOUNT_MAX - AMOUNT_MIN)) * 100

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (disabled) return
    onSubmit(composeQuestion(amount, term, purposeDef, installment))
  }

  return (
    <aside className="loan-panel">
      <div className="loan-grain" aria-hidden="true" />

      <header className="brandbar">
        <div className="wordmark">
          <span className="wordmark-glyph">◈</span>
          <span className="wordmark-name">MERIDIAN</span>
        </div>
        <span className="brandbar-tag">Lending</span>
      </header>

      <div className="loan-hero">
        <p className="loan-eyebrow">Build your loan</p>
        <h1 className="loan-title">Money on<br /><em>your</em> terms.</h1>
        <p className="loan-sub">Set the amount, term, and purpose. Your estimate updates live — then ask our assistant anything.</p>
      </div>

      <form className="loan-form" onSubmit={submit}>
        <div className="field">
          <div className="slider-head">
            <span>Amount</span>
            <span className="slider-value">{currency(amount)}</span>
          </div>
          <input
            className="slider"
            type="range"
            min={AMOUNT_MIN} max={AMOUNT_MAX} step={AMOUNT_STEP}
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            style={{ background: `linear-gradient(to right, var(--blue) ${pct}%, var(--track) ${pct}%)` }}
          />
          <div className="slider-bounds">
            <span>{currency(AMOUNT_MIN)}</span>
            <span>{currency(AMOUNT_MAX)}</span>
          </div>
        </div>

        <div className="field">
          <span className="field-label">Term</span>
          <div className="term-options">
            {TERMS.map(m => (
              <label key={m} className={`term-chip ${term === m ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={term === m}
                  onChange={() => setTerm(m)}
                />
                <span>{m}</span>
                <small>months</small>
              </label>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field-label">Purpose</span>
          <div className="purpose-grid">
            {PURPOSES.map(p => (
              <button
                key={p.value}
                type="button"
                className={`purpose-card ${purpose === p.value ? 'selected' : ''}`}
                onClick={() => setPurpose(p.value)}
              >
                <span className="purpose-icon">{p.icon}</span>
                <span className="purpose-label">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="estimate">
          <div className="estimate-row">
            <span className="estimate-label">Estimated monthly</span>
            <span className="estimate-apr">{purposeDef.apr}% APR</span>
          </div>
          <div className="estimate-value">{installment ? currency(installment) : '—'}</div>
          <div className="estimate-meta">
            <span><b>{currency(amount)}</b> over {term} months</span>
            {installment ? <span><b>{currency(totalInterest)}</b> total interest</span> : null}
          </div>
        </div>

        <button type="submit" className="loan-submit" disabled={disabled}>
          {disabled ? 'Assistant is busy…' : 'Check my eligibility →'}
        </button>
        <p className="loan-disclaimer">
          Illustrative estimate at a sample rate. Not an offer of credit. Final terms depend on a full application and review.
        </p>
      </form>
    </aside>
  )
}

// ---------------------------------------------------------------- chat

function tightenLists(md: string): string {
  return md
    .replace(/^([ \t]*[-*+].*)\n\n(?=[ \t]*[-*+])/gm, '$1\n')
    .replace(/^([ \t]*\d+\..*)\n\n(?=[ \t]*\d+\.)/gm, '$1\n')
    .replace(/([:：])\n\n(?=[ \t]*[-*+])/gm, '$1\n')
}

function Citations({ citations }: { citations: Chunk[] }) {
  const [open, setOpen] = useState(false)
  if (!citations.length) return null
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
                {c.page_numbers?.length ? (
                  <span className="citation-page">p.{c.page_numbers.join(', ')}</span>
                ) : null}
                <span className="citation-sim">{(c.similarity * 100).toFixed(1)}%</span>
              </div>
              <div className="citation-text">{c.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ChatMessage({ msg }: { msg: Message }) {
  const isAssistant = msg.role === 'assistant'
  return (
    <div className={`msg ${msg.role}${msg.error ? ' error' : ''}`}>
      <span className="msg-role">{msg.role === 'user' ? 'You' : 'Loan assistant'}</span>
      <div className="msg-bubble">
        {isAssistant && !msg.error ? (
          <div className="markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {tightenLists(msg.content)}
            </ReactMarkdown>
          </div>
        ) : (
          msg.content
        )}
      </div>
      {isAssistant && <Citations citations={msg.citations ?? []} />}
    </div>
  )
}

const SUGGESTIONS = [
  'What credit score do I need?',
  'Is there a prepayment penalty?',
  'How is my monthly payment calculated?',
  'What happens if I miss a payment?',
]

const STORAGE_KEY = 'rag-chat-history'

export default function LoanAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    } catch { return [] }
  })
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [model, setModel] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, pending])

  function clearHistory() {
    setMessages([])
    localStorage.removeItem(STORAGE_KEY)
  }

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || pending) return

    const userMsg: Message = { role: 'user', content: trimmed }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setPending(true)

    const history = messages
      .slice(-HISTORY_LIMIT * 2)
      .map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history, k: 5 }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error(err.error ?? `HTTP ${res.status}`)
      }
      const data = await res.json()
      if (data.model) setModel(data.model)
      setMessages([...next, { role: 'assistant', content: data.answer, citations: data.citations ?? [] }])
    } catch (e) {
      setMessages([...next, { role: 'assistant', content: (e as Error).message, error: true, citations: [] }])
    } finally {
      setPending(false)
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <div className="app">
      <LoanPanel onSubmit={send} disabled={pending} />

      <div className="chat">
        <header className="chat-header">
          <div className="brand">
            <span className="brand-status"><span className="brand-pulse" /></span>
            <div className="brand-text">
              <span className="brand-title">Loan Assistant</span>
              <span className="brand-byline">grounded in Meridian policies</span>
            </div>
          </div>
          <div className="chat-actions">
            {model && <span className="model-tag">{model}</span>}
            {messages.length > 0 && (
              <button className="clear-btn" onClick={clearHistory} title="Clear history">
                Clear
              </button>
            )}
          </div>
        </header>

        <div className="messages" ref={scrollRef}>
          {messages.length === 0 && !pending && (
            <div className="empty">
              <div className="empty-mark">✦</div>
              <h2 className="empty-title">How can I help with your loan?</h2>
              <p className="empty-sub">Answers cite the exact policy they come from.</p>
              <div className="suggestions">
                {SUGGESTIONS.map(s => (
                  <button key={s} className="suggestion" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => <ChatMessage key={i} msg={m} />)}
          {pending && (
            <div className="thinking">
              <span className="dots"><span /><span /><span /></span>
              <span>Searching the policies…</span>
            </div>
          )}
        </div>

        <form className="composer" onSubmit={e => { e.preventDefault(); send(input) }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask about eligibility, rates, repayment…"
            disabled={pending}
            rows={1}
            autoFocus
          />
          <button type="submit" disabled={pending || !input.trim()} aria-label="Send">→</button>
        </form>
      </div>
    </div>
  )
}
