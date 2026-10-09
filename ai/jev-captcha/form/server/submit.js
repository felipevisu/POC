// POST /api/submit: validate the collector's signals, turn them into a story, ask Jev, block bots.
import { requestFacts } from './facts.js'
import { SignalsError, validateSignals } from './signals.js'
import { writeStory } from './story.js'
import { judge } from './jev.js'

export const BLOCK_AT = 0.8 // pBot at or above this is blocked; tune on real traffic
const MAX_BODY_BYTES = 16 * 1024

const send = (res, status, body) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

async function readJson(req) {
  let raw = ''
  for await (const chunk of req) {
    raw += chunk
    if (raw.length > MAX_BODY_BYTES) throw new SignalsError('body too large')
  }
  try {
    return JSON.parse(raw)
  } catch {
    throw new SignalsError('body must be JSON')
  }
}

export function submitHandler(apiKey) {
  return async (req, res) => {
    if (req.method !== 'POST') return send(res, 405, { error: 'POST only' })
    let body, signals
    try {
      body = await readJson(req)
      signals = validateSignals(body?.signals)
    } catch (err) {
      return send(res, 400, { error: err.message })
    }

    const story = writeStory(signals, requestFacts(req.headers))
    let verdict
    try {
      verdict = await judge(story, apiKey)
    } catch (err) {
      // Never fail open to a bot, and never call a person a bot over an outage.
      console.error('[jev] failed:', err.message)
      return send(res, 503, { error: 'Could not verify the visit, please try again.' })
    }

    const blocked = verdict.pBot >= BLOCK_AT
    console.log(`[jev] ${blocked ? 'BLOCK' : 'pass '} ${verdict.choice} pBot=${verdict.pBot.toFixed(2)}\n  ${story.join('\n  ')}`)
    // shortcut: the story and verdict go back to the browser so the demo can show them; drop them in production, they teach a bot what to fake.
    send(res, blocked ? 403 : 200, { blocked, ...verdict, story })
  }
}
